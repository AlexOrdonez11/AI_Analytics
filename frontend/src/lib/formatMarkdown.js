export function formatForMarkdown(raw) {
  if (!raw) return "";

  let txt = raw.trim();

  // Normalize bullets: lines that look like bullets but are missing leading '- '
  txt = txt
    // Make section headers into ### headings
    .replace(/^(which variables.*)$/gim, '### $1')
    .replace(/^(predicting .*?)$/gim, '#### $1')
    .replace(/^(columns that are unlikely.*)$/gim, '### $1')
    .replace(/^(how to compute importance.*)$/gim, '### $1')
    .replace(/^(example (checklist|pipeline).*?)$/gim, '### $1')
    .replace(/^(recommendation.*)$/gim, '### $1')

    // Ensure bullet points
    .replace(/^\s*([A-Za-z0-9_][^:\n]*?):\s*$/gm, '#### $1') // convert trailing-colon lines to headings
    .replace(/^\s*-\s*/gm, '- ') // normalize dash spacing
    .replace(/^\s*•\s*/gm, '- ') // convert • to -
    .replace(/^\s*·\s*/gm, '- ') // convert · to -

    // Add blank lines before headings for spacing
    .replace(/([^\n])\n(###|####)\s/g, '$1\n\n$2 ')
    // Avoid >2 empty lines
    .replace(/\n{3,}/g, '\n\n');

  return txt;
}