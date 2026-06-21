import { relativeTime } from '../relativeTime'

/**
 * Email body builders. Text bodies feed the mailto provider; the HTML digest
 * template targets the Resend path (inline CSS only — email clients strip
 * stylesheets).
 */

const SEPARATOR = '────────────────────────'

function sourceLine(article) {
  const date = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : relativeTime(article.publishedAt)
  return `${article.sourceName} · ${date}`
}

export function buildSingleText(article, summaryText) {
  return [
    article.title,
    '',
    summaryText,
    '',
    sourceLine(article),
    '',
    `Read full article: ${article.url}`,
    '',
    SEPARATOR,
    'Sent via AIFeed',
  ].join('\n')
}

export function buildDigestText(articles, summaries, personalMessage) {
  const blocks = articles.map((article, index) =>
    [
      `${index + 1}. ${article.title}`,
      sourceLine(article),
      '',
      summaries[article.id]?.text ?? article.excerpt,
      '',
      `Read more: ${article.url}`,
    ].join('\n'),
  )

  const parts = ['AIFeed Digest — Your AI update digest', SEPARATOR]
  if (personalMessage?.trim()) {
    parts.push(personalMessage.trim(), SEPARATOR)
  }
  parts.push(blocks.join(`\n\n${SEPARATOR}\n\n`), SEPARATOR, 'Sent via AIFeed')
  return parts.join('\n\n')
}

const escapeHtml = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export function buildDigestHtml(articles, summaries, personalMessage) {
  const articleBlocks = articles
    .map((article, index) => {
      const summary = summaries[article.id]?.text ?? article.excerpt
      return `
      <tr><td style="padding:20px 24px;border-bottom:1px solid #e5e7eb;">
        <a href="${escapeHtml(article.url)}" style="color:#1f2937;font-size:17px;font-weight:700;text-decoration:none;line-height:1.4;">${index + 1}. ${escapeHtml(article.title)}</a>
        <p style="margin:6px 0 0;color:#9ca3af;font-size:12px;">${escapeHtml(sourceLine(article))}</p>
        <p style="margin:10px 0 0;color:#4b5563;font-size:14px;line-height:1.6;">${escapeHtml(summary)}</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:12px;"><tr>
          <td style="background:#f3f4f6;border-radius:6px;padding:8px 14px;">
            <a href="${escapeHtml(article.url)}" style="color:#4f46e5;font-size:13px;font-weight:600;text-decoration:none;">&rarr; Read full article</a>
          </td>
        </tr></table>
      </td></tr>`
    })
    .join('')

  const messageBlock = personalMessage?.trim()
    ? `<tr><td style="padding:18px 24px;background:#f9fafb;border-bottom:1px solid #e5e7eb;">
         <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.6;font-style:italic;">${escapeHtml(personalMessage.trim())}</p>
       </td></tr>`
    : ''

  return `<!doctype html>
<html>
<body style="margin:0;padding:24px 12px;background:#f3f4f6;font-family:Helvetica,Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="max-width:600px;width:100%;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
    <tr><td style="background:#0f1117;padding:24px;text-align:center;">
      <span style="color:#ffffff;font-size:22px;font-weight:800;">AI<span style="color:#818cf8;">Feed</span></span>
      <p style="margin:6px 0 0;color:#9ca3af;font-size:13px;">Your AI update digest</p>
    </td></tr>
    ${messageBlock}
    ${articleBlocks}
    <tr><td style="padding:18px 24px;text-align:center;">
      <p style="margin:0;color:#9ca3af;font-size:12px;">
        Sent via AIFeed ·
        <a href="mailto:?subject=Unsubscribe" style="color:#9ca3af;">Unsubscribe</a>
      </p>
    </td></tr>
  </table>
</body>
</html>`
}
