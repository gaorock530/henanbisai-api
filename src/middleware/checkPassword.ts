
import checkTOTP from "../lib/totp"

export default (req: any, res: any, next: any) => {
  const {pass} = req.query
  if (!checkTOTP(pass)) return res.status(401).send('401 Unauthorized')
  next()
}