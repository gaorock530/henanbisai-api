import log from '@/lib/log';

export default (req: any, res: any, next: any) => {
  const sid = req.query['sid'];
  log({ sid, url: req.url });
  if (!sid) res.status(403).send('sid Warning');
  else next();
};
