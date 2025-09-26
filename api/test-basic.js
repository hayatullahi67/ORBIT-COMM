module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  res.status(200).json({
    message: 'Basic test working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
};