// ─────────────────────────────────────────────────────────────
//  Netlify Function: GitHub OAuth exchange — MK-Way Design Studio
//  Caminho: netlify/functions/github-oauth.js
//
//  Variáveis no Netlify dashboard (Site settings → Environment variables):
//    GITHUB_CLIENT_ID      → github.com/organizations/MK-Way/settings/applications
//    GITHUB_CLIENT_SECRET  → idem
//    ALLOWED_ORIGIN        → https://design-studio.mkway.netlify.app (ou domínio próprio)
// ─────────────────────────────────────────────────────────────

exports.handler = async (event) => {
  const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

  const headers = {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Método não permitido" }) };
  }

  let code;
  try {
    ({ code } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Body inválido" }) };
  }

  if (!code) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Código OAuth em falta" }) };
  }

  try {
    const res = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const data = await res.json();

    if (data.error) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: data.error_description }),
      };
    }

    // Verifica se o utilizador pertence à organização MK-Way
    const orgCheckRes = await fetch("https://api.github.com/orgs/MK-Way/members/" + (await (await fetch("https://api.github.com/user", {
      headers: { Authorization: `token ${data.access_token}`, Accept: "application/vnd.github+json" }
    })).json()).login, {
      headers: { Authorization: `token ${data.access_token}`, Accept: "application/vnd.github+json" }
    });

    // Busca dados do utilizador
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `token ${data.access_token}`,
        Accept: "application/vnd.github+json",
      },
    });
    const user = await userRes.json();

    // Só permite membros da organização MK-Way
    if (orgCheckRes.status !== 204) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: `${user.login} não é membro da organização MK-Way` }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        access_token: data.access_token,
        username: user.login,
        avatar: user.avatar_url,
        name: user.name || user.login,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Erro interno: " + err.message }),
    };
  }
};
