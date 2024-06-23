export default function log(...arg: any[]) {
  if (process.env.NODE_ENV === 'production') return;
  console.log.apply(null, arg);
}
