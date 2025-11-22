export const errorHandler = (err, res) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server Error' });
};
