import {MD5} from 'crypto-js'

export default function checkTOTP(totp: string){
  const local_totp = Math.floor(Date.now()/1000/2)
  const hash = MD5(local_totp + (process.env.TOTP_SECRET || '')).toString()
  return totp === hash
} 