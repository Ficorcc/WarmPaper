interface Env {
  DB: D1Database;
  ADMIN_PASSWORD: string;
  ADMIN_NICK?: string;
  ADMIN_EMAIL?: string;
  ADMIN_URL?: string;
  SITE_URL?: string;
}

type WalineCommentInput = {
  comment?: string;
  nick?: string;
  mail?: string;
  link?: string;
  url?: string;
  ua?: string;
  pid?: string;
  rid?: string;
  at?: string;
};

type CommentRow = {
  object_id: string;
  url: string;
  nick: string;
  mail: string | null;
  link: string | null;
  comment: string;
  raw_comment: string;
  pid: string | null;
  rid: string | null;
  reply_user_nick: string | null;
  user_id: string | null;
  type: string;
  status: string;
  sticky: number;
  likes: number;
  ua: string | null;
  inserted_at: string;
  updated_at: string;
  addr?: string | null;
  browser?: string | null;
  os?: string | null;
};

type UserRow = {
  object_id: string;
  email: string;
  password: string;
  display_name: string;
  url: string | null;
  avatar: string | null;
  type: string;
  label: string | null;
  two_factor_auth: string | null;
  created_at: string;
  updated_at: string;
};

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS",
  "access-control-allow-headers": "content-type,authorization",
};

const ADMIN_ID = "waline-admin";
const WALINE_ADMIN_VERSION = "0.34.1";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: JSON_HEADERS });
    }

    const url = new URL(request.url);

    try {
      if (url.pathname.startsWith("/ui") || url.pathname.startsWith("/token") || url.pathname.startsWith("/user")) {
        await ensureBootstrapAdmin(env);
      }

      if (url.pathname === "/" || url.pathname === "/health") {
        return json({ errno: 0, data: { name: "warmpaper-waline", ok: true } });
      }

      if (url.pathname === "/ui" || url.pathname.startsWith("/ui/")) {
        return adminPage(env);
      }

      if (url.pathname === "/api/login" && request.method === "POST") {
        return handleLogin(request, env);
      }

      if (url.pathname === "/token") {
        if (request.method === "GET") return handleToken(request, env);
        if (request.method === "POST") return handleTokenLogin(request, env);
      }

      if (url.pathname === "/token/2fa") {
        if (request.method === "GET") return json({ errno: 0, data: { enable: false } });
        if (request.method === "POST") return json({ errno: 0, data: {} });
      }

      if (url.pathname === "/user") {
        if (request.method === "GET") return getAdminUsers(url, request, env);
        if (request.method === "POST") return registerUser(request, env);
        if (request.method === "PUT") return updateUserProfile(request, env);
      }

      if (url.pathname === "/user/password" && request.method === "PUT") {
        return json({ errno: 0, data: {} });
      }

      const userMatch = url.pathname.match(/^\/user\/([^/]+)$/);

      if (userMatch) {
        if (request.method === "PUT") return updateAdminUser(userMatch[1], request, env);
        if (request.method === "DELETE") return deleteAdminUser(userMatch[1], request, env);
      }

      if (url.pathname === "/comment") {
        if (request.method === "GET") return getAdminComments(url, request, env);
        if (request.method === "POST") return addComment(request, env);
      }

      const adminCommentMatch = url.pathname.match(/^\/comment\/([^/]+)$/);

      if (adminCommentMatch) {
        if (request.method === "PUT") return updateComment(adminCommentMatch[1], request, env);
        if (request.method === "DELETE") return deleteComment(adminCommentMatch[1], request, env);
      }

      if (url.pathname === "/db" && request.method === "GET") {
        const admin = await getAuthorizedUser(request, env);

        if (!admin || admin.type !== "administrator") return json({ errno: 401, errmsg: "Unauthorized" }, 401);

        return json({ errno: 0, data: ["Comment", "Users"] });
      }

      if (url.pathname === "/api/comment/rss" && request.method === "GET") {
        return handleRss(url, env);
      }

      if (url.pathname === "/api/comment") {
        if (request.method === "GET") return getComments(url, env);
        if (request.method === "POST") return addComment(request, env);
      }

      const commentMatch = url.pathname.match(/^\/api\/comment\/([^/]+)$/);

      if (commentMatch) {
        if (request.method === "PUT") return updateComment(commentMatch[1], request, env);
        if (request.method === "DELETE") return deleteComment(commentMatch[1], request, env);
      }

      if (url.pathname === "/api/article") {
        if (request.method === "GET") return getArticleCounters(url, env);
        if (request.method === "POST") return updateArticleCounter(request, env);
      }

      if (url.pathname === "/api/user" && request.method === "GET") {
        return getUsers(url, env);
      }

      return json({ errno: 404, errmsg: "Not found" }, 404);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Server error";

      return json({ errno: 500, errmsg: message }, 500);
    }
  },
};

async function getComments(url: URL, env: Env): Promise<Response> {
  const type = url.searchParams.get("type");

  if (type === "count") return getCommentCounts(url, env);
  if (type === "recent") return getRecentComments(url, env);

  const path = url.searchParams.get("path") || "/";
  const pageSize = clampNumber(Number(url.searchParams.get("pageSize") || "10"), 1, 50);
  const page = clampNumber(Number(url.searchParams.get("page") || "1"), 1, 9999);
  const sortBy = url.searchParams.get("sortBy") || "insertedAt_desc";
  const orderBy = sortBy === "insertedAt_asc" ? "inserted_at ASC" : sortBy === "like_desc" ? "likes DESC, inserted_at DESC" : "sticky DESC, inserted_at DESC";
  const offset = (page - 1) * pageSize;
  const total = await countApproved(env, path);
  const roots = await env.DB.prepare(
    `SELECT * FROM comments
     WHERE url = ? AND rid IS NULL AND status = 'approved'
     ORDER BY ${orderBy}
     LIMIT ? OFFSET ?`,
  )
    .bind(path, pageSize, offset)
    .all<CommentRow>();
  const rootIds = roots.results.map((row) => row.object_id);
  let childRows: CommentRow[] = [];

  if (rootIds.length) {
    const placeholders = rootIds.map(() => "?").join(",");

    childRows = (
      await env.DB.prepare(
        `SELECT * FROM comments
         WHERE rid IN (${placeholders}) AND status = 'approved'
         ORDER BY inserted_at ASC`,
      )
        .bind(...rootIds)
        .all<CommentRow>()
    ).results;
  }

  const children = new Map<string, ReturnType<typeof toWalineComment>[]>();

  for (const row of childRows) {
    if (!row.rid) continue;

    const list = children.get(row.rid) || [];

    list.push(toWalineComment(row));
    children.set(row.rid, list);
  }

  return json({
    errno: 0,
    data: {
      count: total,
      data: roots.results.map((row) => ({ ...toWalineComment(row), children: children.get(row.object_id) || [] })),
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  });
}

async function addComment(request: Request, env: Env): Promise<Response> {
  const body = await request.json<WalineCommentInput>();
  const tokenUser = await getAuthorizedUser(request, env);
  const rawComment = String(body.comment || "").trim();
  const url = String(body.url || "/").trim();
  const nick = tokenUser?.display_name || String(body.nick || "匿名").trim();

  if (!rawComment) return json({ errno: 400, errmsg: "请输入评论内容" }, 400);
  if (!url) return json({ errno: 400, errmsg: "缺少评论页面路径" }, 400);
  if (!nick) return json({ errno: 400, errmsg: "请输入昵称" }, 400);

  const now = new Date().toISOString();
  const objectId = crypto.randomUUID();
  const parent = body.pid ? await findComment(env, body.pid) : null;
  const rootId = body.rid || parent?.rid || parent?.object_id || null;
  const type = tokenUser?.type === "administrator" ? "administrator" : "guest";
  const userId = tokenUser?.objectId || objectId;
  const ua = normalizeNullable(body.ua);
  const systemInfo = parseUserAgent(ua);

  await env.DB.prepare(
    `INSERT INTO comments (
      object_id, url, nick, mail, link, comment, raw_comment, pid, rid, reply_user_nick,
      user_id, type, status, sticky, likes, ua, ip, addr, browser, os, inserted_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', 0, 0, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      objectId,
      url,
      nick,
      tokenUser?.email || normalizeNullable(body.mail),
      tokenUser?.url || normalizeNullable(body.link),
      renderComment(rawComment),
      rawComment,
      normalizeNullable(body.pid),
      rootId,
      normalizeNullable(body.at) || parent?.nick || null,
      userId,
      type,
      ua,
      request.headers.get("cf-connecting-ip"),
      visitorLocation(request),
      systemInfo.browser,
      systemInfo.os,
      now,
      now,
    )
    .run();

  const created = await findComment(env, objectId);

  return json({ errno: 0, data: created ? toWalineComment(created) : null });
}

async function updateComment(objectId: string, request: Request, env: Env): Promise<Response> {
  const body = await request.json<Record<string, unknown>>();

  if (typeof body.like === "boolean") {
    await env.DB.prepare("UPDATE comments SET likes = MAX(0, likes + ?), updated_at = ? WHERE object_id = ?")
      .bind(body.like ? 1 : -1, new Date().toISOString(), objectId)
      .run();

    const row = await findComment(env, objectId);

    return json({ errno: 0, data: row ? toWalineComment(row) : null });
  }

  const admin = await getAuthorizedUser(request, env);

  if (!admin) return json({ errno: 401, errmsg: "Unauthorized" }, 401);

  const updates: string[] = [];
  const values: unknown[] = [];

  if (typeof body.comment === "string") {
    updates.push("raw_comment = ?", "comment = ?");
    values.push(body.comment, renderComment(body.comment));
  }

  if (body.status === "approved" || body.status === "waiting" || body.status === "spam") {
    updates.push("status = ?");
    values.push(body.status);
  }

  if (typeof body.sticky === "number" || typeof body.sticky === "boolean") {
    updates.push("sticky = ?");
    values.push(Number(body.sticky));
  }

  if (!updates.length) return json({ errno: 0, data: await findComment(env, objectId) });

  updates.push("updated_at = ?");
  values.push(new Date().toISOString(), objectId);

  await env.DB.prepare(`UPDATE comments SET ${updates.join(", ")} WHERE object_id = ?`).bind(...values).run();

  const row = await findComment(env, objectId);

  return json({ errno: 0, data: row ? toWalineComment(row) : null });
}

async function deleteComment(objectId: string, request: Request, env: Env): Promise<Response> {
  const admin = await getAuthorizedUser(request, env);

  if (!admin) return json({ errno: 401, errmsg: "Unauthorized" }, 401);

  await env.DB.prepare("DELETE FROM comments WHERE object_id = ? OR rid = ?").bind(objectId, objectId).run();

  return json({ errno: 0, data: "" });
}

async function handleLogin(request: Request, env: Env): Promise<Response> {
  const { password } = await request.json<{ password?: string }>();

  if (!env.ADMIN_PASSWORD || password !== env.ADMIN_PASSWORD) {
    return json({ errno: 401, errmsg: "密码不正确" }, 401);
  }

  return json({ errno: 0, data: { ...adminUser(env), token: await createToken(env, ADMIN_ID), remember: true } });
}

async function handleTokenLogin(request: Request, env: Env): Promise<Response> {
  const { email, password } = await request.json<{ email?: string; password?: string }>();
  const user = email ? await findUserByEmail(env, email) : null;

  if (!user || !password || !(await checkPassword(password, user.password)) || user.type === "banned" || user.type.startsWith("verify")) {
    return json({ errno: 401, errmsg: "邮箱或密码不正确" }, 401);
  }

  return json({ errno: 0, data: { ...toWalineUser(user), token: await createToken(env, user.object_id) } });
}

async function handleToken(request: Request, env: Env): Promise<Response> {
  const user = await getAuthorizedUser(request, env);

  if (!user) return json({ errno: 401, errmsg: "Unauthorized" }, 401);

  return json({ errno: 0, data: user });
}

async function registerUser(request: Request, env: Env): Promise<Response> {
  const body = await request.json<{ email?: string; password?: string; display_name?: string; url?: string; avatar?: string }>();
  const email = normalizeNullable(body.email)?.toLowerCase();
  const password = String(body.password || "");
  const displayName = normalizeNullable(body.display_name) || email?.split("@")[0] || "Waline User";

  if (!email) return json({ errno: 400, errmsg: "请输入邮箱" }, 400);
  if (!password) return json({ errno: 400, errmsg: "请输入密码" }, 400);

  const existed = await findUserByEmail(env, email);

  if (existed) return json({ errno: 400, errmsg: "用户已存在" }, 400);

  const count = await countUsers(env);
  const now = new Date().toISOString();

  await env.DB.prepare(
    `INSERT INTO users (object_id, email, password, display_name, url, avatar, type, label, two_factor_auth, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, ?)`,
  )
    .bind(crypto.randomUUID(), email, await hashPassword(password), displayName, normalizeNullable(body.url), normalizeNullable(body.avatar), count ? "guest" : "administrator", now, now)
    .run();

  return json({ errno: 0, data: {} });
}

async function updateUserProfile(request: Request, env: Env): Promise<Response> {
  const user = await getAuthorizedUser(request, env);

  if (!user) return json({ errno: 401, errmsg: "Unauthorized" }, 401);

  const body = await request.json<Record<string, unknown>>();
  const updates: string[] = [];
  const values: unknown[] = [];

  addUserUpdate(updates, values, "display_name", body.display_name);
  addUserUpdate(updates, values, "url", body.url);
  addUserUpdate(updates, values, "avatar", body.avatar);

  if (typeof body.password === "string" && body.password) {
    updates.push("password = ?");
    values.push(await hashPassword(body.password));
  }

  if (!updates.length) return json({ errno: 0, data: {} });

  updates.push("updated_at = ?");
  values.push(new Date().toISOString(), user.objectId);

  await env.DB.prepare(`UPDATE users SET ${updates.join(", ")} WHERE object_id = ?`).bind(...values).run();

  return json({ errno: 0, data: {} });
}

async function getAdminUsers(url: URL, request: Request, env: Env): Promise<Response> {
  const admin = await getAuthorizedUser(request, env);
  const email = normalizeNullable(url.searchParams.get("email"))?.toLowerCase();

  if (email) {
    const user = await findUserByEmail(env, email);

    return json({ errno: 0, data: user ? toWalineUser(user) : null });
  }

  if (!admin || admin.type !== "administrator") return json({ errno: 401, errmsg: "Unauthorized" }, 401);

  const pageSize = clampNumber(Number(url.searchParams.get("pageSize") || "10"), 1, 100);
  const page = clampNumber(Number(url.searchParams.get("page") || "1"), 1, 9999);
  const total = await countUsers(env);
  const rows = await env.DB.prepare(
    `SELECT * FROM users
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
  )
    .bind(pageSize, (page - 1) * pageSize)
    .all<UserRow>();

  return json({
    errno: 0,
    data: {
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      data: rows.results.map(toWalineUser),
    },
  });
}

async function updateAdminUser(objectId: string, request: Request, env: Env): Promise<Response> {
  const admin = await getAuthorizedUser(request, env);

  if (!admin || admin.type !== "administrator") return json({ errno: 401, errmsg: "Unauthorized" }, 401);

  const body = await request.json<Record<string, unknown>>();
  const updates: string[] = [];
  const values: unknown[] = [];

  addUserUpdate(updates, values, "display_name", body.display_name);
  addUserUpdate(updates, values, "url", body.url);
  addUserUpdate(updates, values, "avatar", body.avatar);
  addUserUpdate(updates, values, "label", body.label);

  if (body.type === "administrator" || body.type === "guest" || body.type === "banned") {
    updates.push("type = ?");
    values.push(body.type);
  }

  if (!updates.length) return json({ errno: 0, data: {} });

  updates.push("updated_at = ?");
  values.push(new Date().toISOString(), objectId);

  await env.DB.prepare(`UPDATE users SET ${updates.join(", ")} WHERE object_id = ?`).bind(...values).run();

  return json({ errno: 0, data: {} });
}

async function deleteAdminUser(objectId: string, request: Request, env: Env): Promise<Response> {
  const admin = await getAuthorizedUser(request, env);

  if (!admin || admin.type !== "administrator") return json({ errno: 401, errmsg: "Unauthorized" }, 401);
  if (objectId === admin.objectId) return json({ errno: 400, errmsg: "不能删除当前登录用户" }, 400);

  await env.DB.prepare("UPDATE users SET type = 'banned', updated_at = ? WHERE object_id = ?").bind(new Date().toISOString(), objectId).run();

  return json({ errno: 0, data: {} });
}

async function getAdminComments(url: URL, request: Request, env: Env): Promise<Response> {
  const admin = await getAuthorizedUser(request, env);

  if (!admin) return json({ errno: 401, errmsg: "Unauthorized" }, 401);

  const pageSize = clampNumber(Number(url.searchParams.get("pageSize") || "10"), 1, 100);
  const page = clampNumber(Number(url.searchParams.get("page") || "1"), 1, 9999);
  const status = normalizeNullable(url.searchParams.get("status"));
  const keyword = normalizeNullable(url.searchParams.get("keyword"));
  const owner = normalizeNullable(url.searchParams.get("owner"));
  const clauses: string[] = [];
  const values: unknown[] = [];

  if (admin.type !== "administrator" || owner === "mine") {
    clauses.push("user_id = ?");
    values.push(admin.objectId);
  }

  if (status && status !== "all") {
    clauses.push("status = ?");
    values.push(status);
  }

  if (keyword) {
    clauses.push("(nick LIKE ? OR mail LIKE ? OR raw_comment LIKE ? OR url LIKE ?)");
    values.push(...Array(4).fill(`%${keyword}%`));
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const totalRow = await env.DB.prepare(`SELECT COUNT(*) AS total FROM comments ${where}`).bind(...values).first<{ total: number }>();
  const rows = await env.DB.prepare(
    `SELECT * FROM comments ${where}
     ORDER BY inserted_at DESC
     LIMIT ? OFFSET ?`,
  )
    .bind(...values, pageSize, (page - 1) * pageSize)
    .all<CommentRow>();

  return json({
    errno: 0,
    data: {
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil((totalRow?.total || 0) / pageSize)),
      data: rows.results.map(toWalineComment),
    },
  });
}

async function getCommentCounts(url: URL, env: Env): Promise<Response> {
  const paths = (url.searchParams.get("url") || "").split(",").filter(Boolean);
  const data = [];

  for (const path of paths) {
    data.push(await countApproved(env, decodeURIComponent(path)));
  }

  return json({ errno: 0, data });
}

async function getRecentComments(url: URL, env: Env): Promise<Response> {
  const count = clampNumber(Number(url.searchParams.get("count") || "5"), 1, 20);
  const rows = await env.DB.prepare(
    `SELECT * FROM comments
     WHERE status = 'approved'
     ORDER BY inserted_at DESC
     LIMIT ?`,
  )
    .bind(count)
    .all<CommentRow>();

  return json({ errno: 0, data: rows.results.map(toWalineComment) });
}

async function getUsers(url: URL, env: Env): Promise<Response> {
  const pageSize = clampNumber(Number(url.searchParams.get("pageSize") || "10"), 1, 100);
  const rows = await env.DB.prepare(
    `SELECT nick, mail, link, COUNT(*) AS count
     FROM comments
     WHERE status = 'approved'
     GROUP BY lower(mail), nick, link
     ORDER BY count DESC
     LIMIT ?`,
  )
    .bind(pageSize)
    .all<{ nick: string; mail: string | null; link: string | null; count: number }>();

  return json({
    errno: 0,
    data: rows.results.map((row) => ({
      nick: row.nick,
      link: row.link,
      avatar: "",
      level: Math.min(5, Math.floor(row.count / 5)),
    })),
  });
}

async function getArticleCounters(url: URL, env: Env): Promise<Response> {
  const paths = (url.searchParams.get("path") || "").split(",").filter(Boolean);
  const types = (url.searchParams.get("type") || "time").split(",").filter(Boolean);
  const data = [];

  for (const path of paths) {
    const item: Record<string, number | string> = { path };

    for (const type of types) {
      const row = await env.DB.prepare("SELECT value FROM article_counters WHERE path = ? AND type = ?")
        .bind(path, type)
        .first<{ value: number }>();

      item[type] = row?.value || 0;
    }

    data.push(item);
  }

  return json({ errno: 0, data });
}

async function updateArticleCounter(request: Request, env: Env): Promise<Response> {
  const body = await request.json<{ path?: string; type?: string; action?: string }>();
  const path = body.path || "/";
  const type = body.type || "time";
  const delta = body.action === "desc" ? -1 : 1;

  await env.DB.prepare(
    `INSERT INTO article_counters (path, type, value)
     VALUES (?, ?, ?)
     ON CONFLICT(path, type) DO UPDATE SET value = MAX(0, value + ?)`,
  )
    .bind(path, type, Math.max(0, delta), delta)
    .run();

  const row = await env.DB.prepare("SELECT value FROM article_counters WHERE path = ? AND type = ?")
    .bind(path, type)
    .first<{ value: number }>();

  return json({ errno: 0, data: row?.value || 0 });
}

async function handleRss(url: URL, env: Env): Promise<Response> {
  const path = url.searchParams.get("path");
  const rows = await env.DB.prepare(
    `SELECT * FROM comments
     WHERE status = 'approved' ${path ? "AND url = ?" : ""}
     ORDER BY inserted_at DESC
     LIMIT 20`,
  )
    .bind(...(path ? [path] : []))
    .all<CommentRow>();
  const site = env.SITE_URL || "https://ficor.net";
  const items = rows.results
    .map(
      (row) => `<item><title>${xmlEscape(row.nick)} 的评论</title><link>${xmlEscape(site + row.url)}</link><description>${xmlEscape(
        row.raw_comment,
      )}</description><pubDate>${new Date(row.inserted_at).toUTCString()}</pubDate></item>`,
    )
    .join("");

  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>评论</title>${items}</channel></rss>`, {
    headers: { "content-type": "application/rss+xml; charset=utf-8", "access-control-allow-origin": "*" },
  });
}

function adminPage(env: Env): Response {
  const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Waline 后台</title>
</head>
<body>
  <script>
    window.serverURL = "/";
    window.SITE_NAME = "Waline";
    window.SITE_URL = ${JSON.stringify(env.SITE_URL || "https://ficor.net")};
    window.oauthServices = [];
  </script>
  <script type="module" src="https://cdn.jsdelivr.net/npm/@waline/admin@${WALINE_ADMIN_VERSION}/dist/admin.js"></script>
</body>
</html>`;

  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}

function legacyLoginPage(): Response {
  const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Waline 登录</title>
</head>
<body>
  <script>
    location.replace("/ui/login" + location.search);
  </script>
</body>
</html>`;

  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}

async function findComment(env: Env, objectId: string): Promise<CommentRow | null> {
  return env.DB.prepare("SELECT * FROM comments WHERE object_id = ?").bind(objectId).first<CommentRow>();
}

async function findUser(env: Env, objectId: string): Promise<UserRow | null> {
  return env.DB.prepare("SELECT * FROM users WHERE object_id = ?").bind(objectId).first<UserRow>();
}

async function findUserByEmail(env: Env, email: string): Promise<UserRow | null> {
  return env.DB.prepare("SELECT * FROM users WHERE lower(email) = lower(?)").bind(email).first<UserRow>();
}

async function ensureBootstrapAdmin(env: Env): Promise<void> {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) return;
  if (await countUsers(env)) return;

  const now = new Date().toISOString();

  await env.DB.prepare(
    `INSERT INTO users (object_id, email, password, display_name, url, avatar, type, label, two_factor_auth, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, '', 'administrator', NULL, NULL, ?, ?)`,
  )
    .bind(
      ADMIN_ID,
      env.ADMIN_EMAIL.toLowerCase(),
      await hashPassword(env.ADMIN_PASSWORD),
      env.ADMIN_NICK || "Ficor",
      env.ADMIN_URL || "",
      now,
      now,
    )
    .run();
}

async function countUsers(env: Env): Promise<number> {
  const row = await env.DB.prepare("SELECT COUNT(*) AS total FROM users").first<{ total: number }>();

  return row?.total || 0;
}

async function countApproved(env: Env, path: string): Promise<number> {
  const row = await env.DB.prepare("SELECT COUNT(*) AS total FROM comments WHERE url = ? AND status = 'approved'")
    .bind(path)
    .first<{ total: number }>();

  return row?.total || 0;
}

function toWalineComment(row: CommentRow) {
  return {
    objectId: row.object_id,
    nick: row.nick,
    link: row.link || "",
    mail: row.mail || "",
    comment: row.comment,
    url: row.url,
    time: row.inserted_at,
    insertedAt: row.inserted_at,
    updatedAt: row.updated_at,
    pid: row.pid || undefined,
    rid: row.rid || undefined,
    reply_user: row.reply_user_nick ? { nick: row.reply_user_nick } : undefined,
    user_id: row.user_id || row.object_id,
    type: row.type,
    status: row.status,
    sticky: Boolean(row.sticky),
    like: row.likes,
    addr: row.addr || undefined,
    browser: row.browser || parseUserAgent(row.ua).browser || undefined,
    os: row.os || parseUserAgent(row.ua).os || undefined,
    avatar: "",
  };
}

function toWalineUser(row: UserRow) {
  return {
    objectId: row.object_id,
    email: row.email,
    display_name: row.display_name,
    url: row.url || "",
    avatar: row.avatar || "",
    type: row.type,
    label: row.label || "",
    "2fa": row.two_factor_auth || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function addUserUpdate(updates: string[], values: unknown[], field: string, value: unknown) {
  if (typeof value !== "string") return;

  updates.push(`${field} = ?`);
  values.push(value.trim());
}

function visitorLocation(request: Request): string | null {
  const cf = (request as Request & { cf?: Record<string, unknown> }).cf || {};
  const city = headerOrCf(request, "cf-ipcity", cf.city);
  const region = headerOrCf(request, "cf-region", cf.region);
  const parts = [region, city].filter((part, index, array) => part && array.indexOf(part) === index);

  return parts.length ? parts.join(" ") : null;
}

function headerOrCf(request: Request, header: string, value: unknown): string | null {
  return normalizeNullable(request.headers.get(header)) || (typeof value === "string" ? normalizeNullable(value) : null);
}

function parseUserAgent(ua: string | null): { browser: string | null; os: string | null } {
  if (!ua) return { browser: null, os: null };

  return {
    browser: parseBrowser(ua),
    os: parseOS(ua),
  };
}

function parseBrowser(ua: string): string | null {
  const edge = ua.match(/Edg\/([\d.]+)/);
  const chrome = ua.match(/Chrome\/([\d.]+)/);
  const firefox = ua.match(/Firefox\/([\d.]+)/);
  const safari = ua.includes("Safari") && !ua.includes("Chrome") ? ua.match(/Version\/([\d.]+)/) : null;

  if (edge) return `Edge ${major(edge[1])}`;
  if (chrome) return `Chrome ${major(chrome[1])}`;
  if (firefox) return `Firefox ${major(firefox[1])}`;
  if (safari) return `Safari ${major(safari[1])}`;

  return null;
}

function parseOS(ua: string): string | null {
  const mac = ua.match(/Mac OS X ([\d_]+)/);
  const windows = ua.match(/Windows NT ([\d.]+)/);
  const android = ua.match(/Android ([\d.]+)/);
  const ios = ua.match(/(?:iPhone|iPad).*OS ([\d_]+)/);

  if (mac) return `macOS ${mac[1].replaceAll("_", ".")}`;
  if (ios) return `iOS ${ios[1].replaceAll("_", ".")}`;
  if (android) return `Android ${android[1]}`;
  if (windows) return `Windows ${windowsName(windows[1])}`;
  if (ua.includes("Linux")) return "Linux";

  return null;
}

function windowsName(version: string): string {
  if (version === "10.0") return "10/11";
  if (version === "6.3") return "8.1";
  if (version === "6.2") return "8";
  if (version === "6.1") return "7";

  return version;
}

function major(version: string): string {
  return version.split(".")[0] || version;
}

function renderComment(input: string): string {
  return escapeHtml(input)
    .replace(/\r\n|\r|\n/g, "<br>")
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="nofollow noopener noreferrer">$1</a>');
}

function normalizeNullable(value: unknown): string | null {
  const text = typeof value === "string" ? value.trim() : "";

  return text || null;
}

function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;

  return Math.min(max, Math.max(min, Math.floor(value)));
}

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), { status, headers: JSON_HEADERS });
}

function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] || char);
}

function xmlEscape(input: string): string {
  return escapeHtml(input);
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomUUID().replaceAll("-", "");
  const digest = await sha256(`${salt}:${password}`);

  return `sha256:${salt}:${digest}`;
}

async function checkPassword(password: string, stored: string): Promise<boolean> {
  const [, salt, digest] = stored.split(":");

  if (!salt || !digest) return false;

  return (await sha256(`${salt}:${password}`)) === digest;
}

async function sha256(value: string): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));

  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function createToken(env: Env, userId: string): Promise<string> {
  const payload = JSON.stringify({ sub: userId, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 });
  const encodedPayload = base64url(payload);
  const signature = await sign(encodedPayload, tokenSecret(env));

  return `${encodedPayload}.${signature}`;
}

async function getAuthorizedUser(request: Request, env: Env) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");

  const userId = token ? await verifyToken(token, env) : null;

  if (!userId) return null;

  if (userId === ADMIN_ID) return adminUser(env);

  const user = await findUser(env, userId);

  return user && user.type !== "banned" ? toWalineUser(user) : null;
}

function adminUser(env: Env) {
  return {
    objectId: ADMIN_ID,
    display_name: env.ADMIN_NICK || "Ficor",
    email: env.ADMIN_EMAIL || "",
    url: env.ADMIN_URL || "",
    avatar: "",
    type: "administrator",
  };
}

async function verifyToken(token: string, env: Env): Promise<string | null> {
  const [payload, signature] = token.split(".");

  if (!payload || !signature) return null;
  if ((await sign(payload, tokenSecret(env))) !== signature) return null;

  const data = JSON.parse(new TextDecoder().decode(base64urlDecode(payload))) as { exp?: number; sub?: string };

  if (!data.sub || Number(data.exp) <= Math.floor(Date.now() / 1000)) return null;

  return data.sub;
}

function tokenSecret(env: Env): string {
  return env.ADMIN_PASSWORD || "waline-worker-secret";
}

async function sign(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));

  return base64url(new Uint8Array(signature));
}

function base64url(value: string | Uint8Array): string {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64urlDecode(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(base64);

  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}
