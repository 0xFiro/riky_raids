import config from "@/rikyRaidConfig.json";

export default async function handler(req, res) {
  const { method } = req;
  const origin = req.headers.origin;

  if (method === 'POST') {
    try {
      const response = await fetch(config.publicRpc, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      });

      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error('Error making RPC request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
