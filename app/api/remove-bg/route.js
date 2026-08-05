export async function POST(req) {
  const apiKey = process.env.REMOVE_BG_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Clé API manquante côté serveur.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const incomingForm = await req.formData();
  const file = incomingForm.get('image');
  if (!file) {
    return new Response(JSON.stringify({ error: 'Aucune image reçue.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const forwardForm = new FormData();
  forwardForm.append('image_file', file);
  forwardForm.append('size', 'auto');

  const removeBgRes = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: { 'X-Api-Key': apiKey },
    body: forwardForm,
  });

  if (!removeBgRes.ok) {
    const errText = await removeBgRes.text();
    return new Response(JSON.stringify({ error: errText }), {
      status: removeBgRes.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const buffer = await removeBgRes.arrayBuffer();
  return new Response(buffer, {
    status: 200,
    headers: { 'Content-Type': 'image/png' },
  });
}
