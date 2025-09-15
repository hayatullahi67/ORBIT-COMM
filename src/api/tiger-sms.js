export default async function handler(req, res) {
  const { url } = req.query
  const tigerRes = await fetch(url)
  const text = await tigerRes.text()
  res.status(200).send(text)
}