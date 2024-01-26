import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import fs from 'fs'
import { readFile, writeFile } from 'node:fs/promises'
import cookieParser from 'cookie-parser'
import parse from 'node-html-parser'
import puppeteer from 'puppeteer-core'
import https from 'https'
import axios from 'axios'
import MongodbClient from './database'

//For env File 
dotenv.config();

const app: Application = express();




const PORT = process.env.PORT || 5001

const server = https.createServer(
  {
    key: fs.readFileSync(__dirname + '/ssl/code.key'),
    cert: fs.readFileSync(__dirname + '/ssl/code.crt'),
  },
  app
)

app.set('x-powered-by', false)
app.use(cookieParser())
/**
 * Cors
 */
// const corsOptions = {
// 	// origin: function (origin: any, callback: any) {
// 	// 	console.log({ origin })
// 	// 	if (whitelist.indexOf(origin) !== -1) {
// 	// 		callback(null, true)
// 	// 	} else {
// 	// 		callback(new Error('Not allowed by CORS'))
// 	// 	}
// 	// },
// 	credentials: true,
// }
app.use(cors())

app.use(express.static(__dirname + '/uploads'))

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

/**
 * @description All WebSocket events logic
 * sets important cookies on initial ws connection
 */
// WebSocket(server)

// app.use(require('./router/robot'))
// app.use(require('./router/upload'))
// app.use(require('./router/login'))

const cookie = "PHPSESSID=5dsbimkv6pu4rgnga42rthbsco; __51vcke__K4Eg8SGElFhlWvHA=c02e95a2-c4ca-5172-811e-0ea49a7d1a97; __51vuft__K4Eg8SGElFhlWvHA=1685164511733; _ga_JPNTDP3XJE=GS1.1.1685766273.15.0.1685766273.0.0.0; Hm_lvt_20dbded09f6ac464b84faec7ab3a278b=1691308021; Hm_lpvt_20dbded09f6ac464b84faec7ab3a278b=1693593774; mbt_theme_night=1; _ga=GA1.1.519116480.1643790333; wordpress_test_cookie=WP%20Cookie%20check; zh_choose=s; Hm_lvt_7233eaff4ea4aa81ba9933f3a0e42474=1704983825; wordpress_logged_in_c31b215c0db6cdb6478d719de4022ec2=punkhead%7C1706198697%7CBzcAbicqCXpnlDPdiCS8McKS5AduVKv1dDlmRdeRblK%7C94e7c1ab620dbe6aa6d83d3d6b9278a1dde38b28fa603ccf3f041e8e2340d2dd; erphp_login_tips=1; mycred_site_visit=1; __51uvsct__K4Eg8SGElFhlWvHA=104; __vtins__K4Eg8SGElFhlWvHA=%7B%22sid%22%3A%20%2295c487a1-689a-50fd-b96f-99dc54a687e1%22%2C%20%22vd%22%3A%206%2C%20%22stt%22%3A%2076242%2C%20%22dr%22%3A%204949%2C%20%22expires%22%3A%201704990975872%2C%20%22ct%22%3A%201704989175872%7D; _ga_EYK4RPLNVD=GS1.1.1704989087.40.1.1704989175.0.0.0; Hm_lpvt_7233eaff4ea4aa81ba9933f3a0e42474=1704989176"

const temphtml = {
  string: '',
}

app.get('/', (req, res) => {
  res.json({ status: 'template server ready' })
})

app.get('/parse', async (req, res) => {
  try {
    if (!temphtml.string) {
      const pagehtml = await readFile('page.txt')
      temphtml.string = pagehtml.toString()
    }

    // parse response html string into dom
    const dom = parse(temphtml.string)
    const title = dom.querySelector('.article-title')?.innerText
    const source = dom.querySelector('.article-meta .post-sign')?.innerText
    const sourceRegion = dom.querySelector(
      '.article-meta .item-cats a'
    )?.innerText
    // const publishDate = dom.querySelector('.article-meta .icon-time')?.nextSibling.textContent

    const introductionNodes = dom.querySelectorAll(
      '.article-content.clearfix > p'
    )
    const details: Record<string, string> = {}
    let type: string = ''
    for (const p of introductionNodes) {
      if (p.childNodes.length === 1) {
        const rawText = p.textContent.replace(/\s*/g, '')
        const sig = rawText.split(/[：:]/g)
        type = sig[0]
        continue
      }

      for (const node of p.childNodes) {



        // 1 - ELEMENT_NODE, 3 - TEXT_NODE
        if (node.nodeType === 1) {

          if (
            !node.innerText.trim() ||
            node.innerText.trim() === '&nbsp; &nbsp; &nbsp;'
          )
            continue
          details[type] = details[type]
            ? details[type] + node.innerText
            : node.innerText

          details[type] = details[type].replace('\n', '')
        } else if (node.nodeType === 3) {
          let text = ''
          const rawText = node.textContent.replace(/\s*/g, '')
          const sig = rawText.split(/[：:]/g)

          if (sig[1] === undefined) {
            details[type] = details[type]
              ? details[type] + node.innerText
              : node.innerText
            continue
          }
          text = sig[1].trim()
          if (sig[0]) type = sig[0].trim()
          if (text === '') continue

          details[type] = text
        } else {
          console.log('*', node.nodeType, node.innerText)
        }
      }
    }

    const photos = dom.querySelectorAll('.article-content.clearfix p img')
    const urls = []
    for (const img of photos) {
      if (img.getAttribute('src')) urls.push(img.getAttribute('src'))
    }



    res.json({
      title,
      source,
      sourceRegion,
      // publishDate,
      details,
      urls
    })
  } catch (e: any) {
    res.json({ error: e.toString() })
  }
})

app.get('/read', async (req, res) => {
  try {
    // get html page content
    const htmlRes = await axios.get('https://www.lgych.com/70527.html', {
      headers: {
        Cookie: cookie,
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    })

    if (htmlRes.status !== 200) throw Error(htmlRes.statusText)
    await writeFile('page.txt', htmlRes.data)
    temphtml.string = htmlRes.data
    res.send(htmlRes.data)
  } catch (e: any) {
    res.json({ error: e.toString() })
  }
})

app.get('/get', async (req, res) => {
  const q = req.query.q
  if (!q) {
    res.send('no q')
    return
  }
  try {
    // get html page content
    const htmlRes = await axios.get(q.toString(), {
      headers: {
        Cookie:
          'zh_choose=s; wordpress_sec_c31b215c0db6cdb6478d719de4022ec2=punkhead%7C1703775643%7CvbxtrsdrRdTOAM10NFH7W7Mxw8lMejv8wAq6OkFRC14%7C2caed6a352b75c92aefe5f0c48fb80734a4a66ff50895c47217d6ee6d6cc4134; PHPSESSID=5dsbimkv6pu4rgnga42rthbsco; __51vcke__K4Eg8SGElFhlWvHA=c02e95a2-c4ca-5172-811e-0ea49a7d1a97; __51vuft__K4Eg8SGElFhlWvHA=1685164511733; _ga_JPNTDP3XJE=GS1.1.1685766273.15.0.1685766273.0.0.0; Hm_lvt_20dbded09f6ac464b84faec7ab3a278b=1691308021; Hm_lpvt_20dbded09f6ac464b84faec7ab3a278b=1693593774; zh_choose=s; mbt_theme_night=1; _ga=GA1.1.519116480.1643790333; zanIds=180; wp-settings-time-26307=1702105524; wp-settings-26307=editor%3Dtinymce; Hm_lvt_7233eaff4ea4aa81ba9933f3a0e42474=1702304299; wordpress_logged_in_c31b215c0db6cdb6478d719de4022ec2=punkhead%7C1703775643%7CvbxtrsdrRdTOAM10NFH7W7Mxw8lMejv8wAq6OkFRC14%7C6d45414ceba297077303c2521dec11582aa102b15e3b1efded1c95dd611b9c41; erphp_login_tips=0; mycred_site_visit=1; __51uvsct__K4Eg8SGElFhlWvHA=80; Hm_lpvt_7233eaff4ea4aa81ba9933f3a0e42474=1702729886; __vtins__K4Eg8SGElFhlWvHA=%7B%22sid%22%3A%20%229460ee28-0341-5727-b407-a403883a1339%22%2C%20%22vd%22%3A%208%2C%20%22stt%22%3A%202056956%2C%20%22dr%22%3A%20195620%2C%20%22expires%22%3A%201702731685719%2C%20%22ct%22%3A%201702729885719%7D; _ga_EYK4RPLNVD=GS1.1.1702727828.13.1.1702729885.0.0.0',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    })

    console.log(htmlRes)

    if (htmlRes.status !== 200) throw Error(htmlRes.statusText)
    await writeFile('page.txt', htmlRes.data)
    temphtml.string = htmlRes.data
    res.send(htmlRes.data)
  } catch (e: any) {
    res.json({ error: e.toString() })
  }
})

app.get('/redirect', async (req, res) => {
  const q = req.query.q
  if (!q) {
    res.send('no q')
    return
  }
  try {
    const axiosInstance = axios.create();
    axiosInstance.defaults.maxRedirects = 1; // Set to 0 to prevent automatic redirects
    const htmlRes = await axiosInstance.get(q.toString(), {
      headers: {
        // ':authority': 'www.lgych.com',
        // ':method': 'GET',
        // ':path': '/wp-content/plugins/erphpdown/download.php?postid=38608&key=1&index=',
        // ':scheme': 'https',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7,zh-TW;q=0.6',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        Cookie:
          'zh_choose=s; wordpress_sec_c31b215c0db6cdb6478d719de4022ec2=punkhead%7C1703775643%7CvbxtrsdrRdTOAM10NFH7W7Mxw8lMejv8wAq6OkFRC14%7C2caed6a352b75c92aefe5f0c48fb80734a4a66ff50895c47217d6ee6d6cc4134; PHPSESSID=5dsbimkv6pu4rgnga42rthbsco; __51vcke__K4Eg8SGElFhlWvHA=c02e95a2-c4ca-5172-811e-0ea49a7d1a97; __51vuft__K4Eg8SGElFhlWvHA=1685164511733; _ga_JPNTDP3XJE=GS1.1.1685766273.15.0.1685766273.0.0.0; Hm_lvt_20dbded09f6ac464b84faec7ab3a278b=1691308021; Hm_lpvt_20dbded09f6ac464b84faec7ab3a278b=1693593774; zh_choose=s; mbt_theme_night=1; _ga=GA1.1.519116480.1643790333; zanIds=180; wp-settings-time-26307=1702105524; wp-settings-26307=editor%3Dtinymce; Hm_lvt_7233eaff4ea4aa81ba9933f3a0e42474=1702304299; wordpress_logged_in_c31b215c0db6cdb6478d719de4022ec2=punkhead%7C1703775643%7CvbxtrsdrRdTOAM10NFH7W7Mxw8lMejv8wAq6OkFRC14%7C6d45414ceba297077303c2521dec11582aa102b15e3b1efded1c95dd611b9c41; erphp_login_tips=0; mycred_site_visit=1; __51uvsct__K4Eg8SGElFhlWvHA=80; Hm_lpvt_7233eaff4ea4aa81ba9933f3a0e42474=1702729886; __vtins__K4Eg8SGElFhlWvHA=%7B%22sid%22%3A%20%229460ee28-0341-5727-b407-a403883a1339%22%2C%20%22vd%22%3A%208%2C%20%22stt%22%3A%202056956%2C%20%22dr%22%3A%20195620%2C%20%22expires%22%3A%201702731685719%2C%20%22ct%22%3A%201702729885719%7D; _ga_EYK4RPLNVD=GS1.1.1702727828.13.1.1702729885.0.0.0',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    })
    console.log(htmlRes.headers)
    if (htmlRes.status !== 200) throw Error(htmlRes.statusText)
    await writeFile('page.txt', htmlRes.data)
    temphtml.string = htmlRes.data
    res.send(htmlRes.data)
  } catch (e: any) {
    res.json({ error: e.toString() })
  }
})

const pan_cookie = [
  'CS	FE7DC32BEB02B35F4B10EC4C3D0C5B7E44F7878595E74ADC75983FBAC4791816	pan.baidu.com	/share',
  'XFS	O+nxlqjHrAC3DSi1ubE4urobS59klat+WlA/OAn0oh4=	xlab.baidu.com	/',
  'HMTK	1	hm.baidu.com	/',
  'pcsett	1706266359-e23e737b7cde6c2d6979a7605494d1eb	.pcs.baidu.com	/',
  'ab_sr	1.0.1_M2EyZTRlMWU2YTU2ZTU4NWJiM2MxNmFmMzQ5OGRjMTljOGU0MTZmYTQyYzM0NjE0NGM5ODY3NmE5Mzk3OGMwNDA3NzA3MDU0ZTljOTlkYzIwNTBkMjBmMTRkMzY4ODYxNDEzZGEwNWNlY2FkZWVkYTFkODRlZDRkODMyMmM4MmIyOTc3ODQ0MzliN2NjMzUyMjQyOGI1ZWIzNjNhOTQxNTdlY2NiMGQwZWFhNzk1MGVhNTY0ZGU4ZTA3NDM1MGM1MzAzYTU4ZjI5ZTI4MzgzNjhiN2I1NDNkNTNkZGJhZTk=	.baidu.com	/',
  'ndut_fmt	F4092222D172EF98211475302AE4C82BFBBBB4AE009E7D559689EABD5834E8DC	pan.baidu.com	/',
  'PANPSC	3979432734587441064%3AKkwrx6t0uHAniZpAMa4AEEy7txDAjOFZRbw49Y5v5NCUnH0D70rj1ivbCphtI0nM8JOp%2F68XGKLRyVky035tyO5qPPkFjOIDCqcpamQkCIlk%2FzCt4mbzqKiL3EJlgS7xZ0OG5lQgLmhfZeVSwpGLRrBu2GS532flGQkywSkuuxIxGZiuUUeCal1pBNg8gtV%2Fr1Mfimlqq%2B74E%2BxIOlMk2w%3D%3D	.pan.baidu.com	/',
  'BDCLND	F6t5vR8WamR5iIB9RGadzIo1pYgAKmk1u%2F2Q1rUMLWA%3D	.pan.baidu.com	/',
  'BDSFRCVID_BFESS	KCAOJeC62wDdzJ5fmU2p5ToL1Qft3dvTH6aoCax3r-ZozSqD1IVqEG0PBf8g0KAb-1hKogKKBeOTHFIF_2uxOjjg8UtVJeC6EG0Ptf8g0f5	.baidu.com	/',
  'PSINO	1	.baidu.com	/',
  'HMACCOUNT_BFESS	3FC1702A6F25AFB8	.hm.baidu.com	/',
  'ZFY	uMxy3g9Ddmxq:AaDF9E1mfFEe5IlDWurshxDJnON9c6c:C	.baidu.com	/',
  'BAIDUID_BFESS	3119C78314041F42E5B5AF134AA0AC0A:FG=1	.baidu.com	/',
  'STOKEN	bb5780d3186af897f76282f3ae9adf996c0f61b85f1e1c3e2f7fe037b7fa98dd	.pcs.baidu.com	/',
  'H_BDCLCKID_SF_BFESS	tbPj_D_XJIK3Hnjgq4JShP0ehmT22-usMjAj2hcH0KLKEI32X-Qkb4FSKN5-axniJDQEKfcIWfb1MRjvKPQlqDujbMOJBpoqLn74-p5TtUJD8DnTDMRhXJtWhnbyKMni0DT9-pnjLpQrh459XP68bTkA5bjZKxtq3mkjbPbDfn02eCKuj5AhDjJQjH8s-P-jttoOXRRXtIK_Hnur3f7PXUI8LNDH36vHfRuf0DTD-PJqjqvoWxcAMj8TDnO7ttoy-nn8KbrtafjWqp39DMCWXxL1Db3AKjvMtg3t2R6hbIQoepvoL4oc3Mks0-jdJJQOBKQB0KnGbUQkeq8CQft20b0EeMtjKjLEtRk8oI85JDvDqTrP-trf5DCShUFsa-TRB2Q-XPoO3KJMDfT2bxbZKxIVLNbPhPnbQ6cpBfbgylRp8P3y0bb2DUA1y4vp0qbt0mTxoUJ2Bb3IsxjMqtnWbJ_ebPRi3tQ9QgbMbpQ7tt5W8ncFbT7l5hKpbt-q0x-jLTnhVn0MBCK0hD0wD5-bj6P8qxbXetr0KCOEBn58HJOoDDvX5nocy4LbKxnxJn3LyGnh5MT-WJoThU59MPOl5lKq3-OkWUQ0BecKQR393p3HffQD3noNQfbQ0hO9KMjlLG4LW-nH-R7JOpvtbfnxy--rQRPH-Rv92DQMVU52QqcqEIQHQT3m5-5bbN3ut6IHJR4foDPXJCvbfP0k-P7Eh4_VMfOba46MHD7XVhvn0l7keq8CDRJUbbIpjfjLL6jjJGny2Ijl5t-5e-Q2y5jHhUt_2abHelTyMH7DKIjYQtjpsIJML4DWbT8ULfKLJ4viaKviahoHBMb1slTDBT5h2M4qMxtOLR3pWDTm_q5TtUJMeCnTD-Dhe4tX-NFtJ6FHJf5	.baidu.com	/',
  'STOKEN	bb5780d3186af897f76282f3ae9adf99e7e9a6dc265cee35ba1d5bc8142ac638	.pan.baidu.com	/',
  'H_PS_PSSID	40132_40156_39996	.baidu.com	/',
  'XFT	mtxu2Js3aEpIbyylAa5I/mgjksuHlqoQX54/fGXxIUY=	pan.baidu.com	/disk',
  'BDUSS	lVCMFlTbWQ0dXk5Mlp1amV-Z0JYTDBMWWx-dTRHalMwSE9xaEgwczFMSzBOdGRsRUFBQUFBJCQAAAAAAAAAAAEAAAAMT3gzQ2hlbm5pZTUyMDEzMTQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALSpr2W0qa9lT	.baidu.com	/',
  'ab_jid_BFESS	44db00b133a1e5dc74083468b56a9ffb62d6	.miao.baidu.com	/',
  'newlogin	1	.baidu.com	/',
  'BDUSS_BFESS	lVCMFlTbWQ0dXk5Mlp1amV-Z0JYTDBMWWx-dTRHalMwSE9xaEgwczFMSzBOdGRsRUFBQUFBJCQAAAAAAAAAAAEAAAAMT3gzQ2hlbm5pZTUyMDEzMTQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALSpr2W0qa9lT	.baidu.com	/',
  'H_BDCLCKID_SF	tbPj_D_XJIK3Hnjgq4JShP0ehmT22-usMjAj2hcH0KLKEI32X-Qkb4FSKN5-axniJDQEKfcIWfb1MRjvKPQlqDujbMOJBpoqLn74-p5TtUJD8DnTDMRhXJtWhnbyKMni0DT9-pnjLpQrh459XP68bTkA5bjZKxtq3mkjbPbDfn02eCKuj5AhDjJQjH8s-P-jttoOXRRXtIK_Hnur3f7PXUI8LNDH36vHfRuf0DTD-PJqjqvoWxcAMj8TDnO7ttoy-nn8KbrtafjWqp39DMCWXxL1Db3AKjvMtg3t2R6hbIQoepvoL4oc3Mks0-jdJJQOBKQB0KnGbUQkeq8CQft20b0EeMtjKjLEtRk8oI85JDvDqTrP-trf5DCShUFsa-TRB2Q-XPoO3KJMDfT2bxbZKxIVLNbPhPnbQ6cpBfbgylRp8P3y0bb2DUA1y4vp0qbt0mTxoUJ2Bb3IsxjMqtnWbJ_ebPRi3tQ9QgbMbpQ7tt5W8ncFbT7l5hKpbt-q0x-jLTnhVn0MBCK0hD0wD5-bj6P8qxbXetr0KCOEBn58HJOoDDvX5nocy4LbKxnxJn3LyGnh5MT-WJoThU59MPOl5lKq3-OkWUQ0BecKQR393p3HffQD3noNQfbQ0hO9KMjlLG4LW-nH-R7JOpvtbfnxy--rQRPH-Rv92DQMVU52QqcqEIQHQT3m5-5bbN3ut6IHJR4foDPXJCvbfP0k-P7Eh4_VMfOba46MHD7XVhvn0l7keq8CDRJUbbIpjfjLL6jjJGny2Ijl5t-5e-Q2y5jHhUt_2abHelTyMH7DKIjYQtjpsIJML4DWbT8ULfKLJ4viaKviahoHBMb1slTDBT5h2M4qMxtOLR3pWDTm_q5TtUJMeCnTD-Dhe4tX-NFtJ6FHJf5	.baidu.com	/',
  'csrfToken	utMX-tXAya1fL8ZN0MiTrWw8	pan.baidu.com	/',
  'BIDUPSID	1B8A8E08F7A8EBBFB868CF5B6656710E	.baidu.com	/',
  'BDSFRCVID	KCAOJeC62wDdzJ5fmU2p5ToL1Qft3dvTH6aoCax3r-ZozSqD1IVqEG0PBf8g0KAb-1hKogKKBeOTHFIF_2uxOjjg8UtVJeC6EG0Ptf8g0f5	.baidu.com	/',
  'STOKEN	bb5780d3186af897f76282f3ae9adf996c0f61b85f1e1c3e2f7fe037b7fa98dd	.pcsdata.baidu.com	/',
  'BAIDUID	3119C78314041F42E5B5AF134AA0AC0A:FG=1	.baidu.com	/',
  'H_WISE_SIDS_BFESS	219946_216840_213348_214803_110085_243877_244712_249892_254831_256739_254317_257586_258370_230288_253022_260330_261714_261630_262050_259626_236312_262487_261868_262743_262747_259305_263073_256998_263278_263347_257289_263875_262282_263908_263366_264123_256419_256223_264286_264367_259558_256083_264333_264743_265008_265029_259945_265056_265137_264811_261036_260877_261935_263540_265471_265524_263597_265592_265647_265702_265614_259734_265780_265851_263619_265910_261929_262559_265881_266021_265989_264770_266098_257015_265289_265276_259730_234296_234207_266186_265801_266122_266199_264643_257442_266323_265970_259735_266398_266530_203518_257179_266444_266689_266676	.baidu.com	/',
  'XFT	XKSbLki89p5T3824hqnoQJbKIAdpjQFhAeBAcSasai0=	pan.baidu.com	/share',
  'ab_jid	44db00b133a1e5dc74083468b56a9ffb62d6	.miao.baidu.com	/',
  'BDORZ	B490B5EBF6F3CD402E515D22BCDA1598	.baidu.com	/',
  'XFI	2ef5d8f1-434d-5f64-b5f9-4fb01393dfca	pan.baidu.com	/share',
  'PSTM	1672842634	.baidu.com	/',
  'Hm_lpvt_7a3960b6f067eb0085b7f96ff5e660b0	1706179814	.pan.baidu.com	/',
  'Hm_lpvt_95fc87a381fad8fcb37d76ac51fefcea	1706159882	.pan.baidu.com	/',
  'Hm_lvt_7a3960b6f067eb0085b7f96ff5e660b0	1706011169	.pan.baidu.com	/',
  'Hm_lvt_95fc87a381fad8fcb37d76ac51fefcea	1706159867	.pan.baidu.com	/',
  'H_WISE_SIDS	219946_216840_213348_214803_110085_243877_244712_249892_254831_256739_254317_257586_258370_230288_253022_260330_261714_261630_262050_259626_236312_262487_261868_262743_262747_259305_263073_256998_263278_263347_257289_263875_262282_263908_263366_264123_256419_256223_264286_264367_259558_256083_264333_264743_265008_265029_259945_265056_265137_264811_261036_260877_261935_263540_265471_265524_263597_265592_265647_265702_265614_259734_265780_265851_263619_265910_261929_262559_265881_266021_265989_264770_266098_257015_265289_265276_259730_234296_234207_266186_265801_266122_266199_264643_257442_266323_265970_259735_266398_266530_203518_257179_266444_266689_266676	.baidu.com	/',
  'ab_bid	4137cf638fc410c5fb56be32770d32e365d3	.miao.baidu.com	/',
  'BA_HECTOR	a58g80a50l212g21al8gag2595t8381ir4f6r1t	.baidu.com	/',
  'XFCS	9D15AB16C6680DC638755FE9221927C6CC55420E109AE2E7CFE7521AA893ACD0	pan.baidu.com	/disk',
  'PANWEB	1	.pan.baidu.com	/',
  'XFI	17d3ac50-2f52-c89d-1af2-9844833d676d	pan.baidu.com	/disk',
]

app.get('/share', async (req, res) => {
  let page
  try {
    const browser = await puppeteer.launch({ executablePath: "C:/Program\ Files/Google/Chrome/Application/chrome.exe", headless: false });
    page = await browser.newPage();
    for (const co of pan_cookie) {
      const part = co.split('	')
      await page.setCookie({"name": part[0], "value": part[1], "domain": part[2], "path": part[3]})
    }
    await page.goto('https://pan.baidu.com/disk/main#/index?category=all&path=%2Ftransfer%2Fblu-ray%2F1');
    
    const tableSelector = await page.$('table.wp-s-pan-table__body-table tbody>tr:nth-child(1) button.u-button.wp-s-agile-tool-bar__h-action-button')

    await tableSelector?.evaluate(el => el.click());
    
    const timeSelector = await page.waitForSelector('label.u-radio.wp-s-radio-group-hoc__item-radio:nth-child(4)')
    await timeSelector?.evaluate(el => el.click());
    const shareSelector = await page.waitForSelector('button.u-button.wp-s-dialog-button-hoc.wp-s-share-to-link__create-form-submit--button.u-button--primary.u-button--medium')
    await shareSelector?.evaluate(el => el.click());
    const copySelector = await page.waitForSelector('.wp-s-share-to-link__link-info-url.u-input.u-input--small input')
    const link = await copySelector?.evaluate(el => el.value);
    const codeSelector = await page.waitForSelector('.wp-s-share-to-link__link-pwd input')
    const pwd = await codeSelector?.evaluate(el => el.value);

    





    const pic = await page.screenshot({ encoding: 'base64' })
    res.send(`<img src="data:image/jpeg;base64,${pic}" /> <p>${link}</p> <p>${pwd}</p>`)
  } catch(e:any) {
    console.log(e)
    res.send(e.toString())
  } finally {

    
  }
})


app.get('/u', async (req, res) => {
  // const cookie = 'PHPSESSID=5dsbimkv6pu4rgnga42rthbsco; __51vcke__K4Eg8SGElFhlWvHA=c02e95a2-c4ca-5172-811e-0ea49a7d1a97; __51vuft__K4Eg8SGElFhlWvHA=1685164511733; _ga_JPNTDP3XJE=GS1.1.1685766273.15.0.1685766273.0.0.0; Hm_lvt_20dbded09f6ac464b84faec7ab3a278b=1691308021; Hm_lpvt_20dbded09f6ac464b84faec7ab3a278b=1693593774; _ga=GA1.1.519116480.1643790333; wordpress_test_cookie=WP%20Cookie%20check; Hm_lvt_7233eaff4ea4aa81ba9933f3a0e42474=1704983825; zh_choose=s; mbt_theme_night=1; __51uvsct__K4Eg8SGElFhlWvHA=121; wordpress_logged_in_c31b215c0db6cdb6478d719de4022ec2=punkhead%7C1707320021%7CM02SU7z2vZqHq9yHpEx1SHPPBPOi5uATaXKFqwk2f3j%7C56450092bbebe6eb525e204c4d262047ddc9e8e6594e0a231766d888b4bb990c; erphp_login_tips=1; mycred_site_visit=1; Hm_lpvt_7233eaff4ea4aa81ba9933f3a0e42474=1706110520; __vtins__K4Eg8SGElFhlWvHA=%7B%22sid%22%3A%20%2222b1297c-7a41-5536-a739-2b7f6a1b325b%22%2C%20%22vd%22%3A%207%2C%20%22stt%22%3A%20109438%2C%20%22dr%22%3A%2066263%2C%20%22expires%22%3A%201706111999999%2C%20%22ct%22%3A%201706110520110%7D; _ga_EYK4RPLNVD=GS1.1.1706110410.59.1.1706110609.0.0.0'
  // const cookie2 = 'zh_choose=s; wordpress_sec_c31b215c0db6cdb6478d719de4022ec2=punkhead%7C1707320021%7CM02SU7z2vZqHq9yHpEx1SHPPBPOi5uATaXKFqwk2f3j%7C508acdd62ae3dab934d235cf6dd83b5a645956538f80917961b82484a9a4f6bb; PHPSESSID=5dsbimkv6pu4rgnga42rthbsco; __51vcke__K4Eg8SGElFhlWvHA=c02e95a2-c4ca-5172-811e-0ea49a7d1a97; __51vuft__K4Eg8SGElFhlWvHA=1685164511733; _ga_JPNTDP3XJE=GS1.1.1685766273.15.0.1685766273.0.0.0; Hm_lvt_20dbded09f6ac464b84faec7ab3a278b=1691308021; Hm_lpvt_20dbded09f6ac464b84faec7ab3a278b=1693593774; _ga=GA1.1.519116480.1643790333; wordpress_test_cookie=WP%20Cookie%20check; Hm_lvt_7233eaff4ea4aa81ba9933f3a0e42474=1704983825; zh_choose=s; mbt_theme_night=1; wordpress_logged_in_c31b215c0db6cdb6478d719de4022ec2=punkhead%7C1707320021%7CM02SU7z2vZqHq9yHpEx1SHPPBPOi5uATaXKFqwk2f3j%7C56450092bbebe6eb525e204c4d262047ddc9e8e6594e0a231766d888b4bb990c; erphp_login_tips=1; mycred_site_visit=1; __vtins__K4Eg8SGElFhlWvHA=%7B%22sid%22%3A%20%228e70dd77-5e13-5c2a-82de-cfcf3ae00709%22%2C%20%22vd%22%3A%201%2C%20%22stt%22%3A%200%2C%20%22dr%22%3A%200%2C%20%22expires%22%3A%201706113878450%2C%20%22ct%22%3A%201706112078450%7D; __51uvsct__K4Eg8SGElFhlWvHA=122; Hm_lpvt_7233eaff4ea4aa81ba9933f3a0e42474=1706112079; _ga_EYK4RPLNVD=GS1.1.1706110410.59.1.1706112250.0.0.0'
  try {
    const browser = await puppeteer.launch({ executablePath: "C:/Program\ Files/Google/Chrome/Application/chrome.exe", headless: false });
    // const browser = await puppeteer.launch({ executablePath: "C:/Program\ Files\ (x86)/Google/Chrome/Application/chrome.exe", headless: "new" });
    // const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    // await page.setViewport({ width: 1080, height: 1024 });
    // Navigate the page to a URL
    // await page.setExtraHTTPHeaders({ "Cookie": cookie2 })
    await page.setCookie({"name": "zh_choose", "value": "s", "domain": "www.lgych.com", "path": "/wp-content/plugins"})
    await page.setCookie({"name": "ab_sr", "value": "1.0.1_NTAyZWFiNTIyMGY2NGFlODc5MWNmZTBkNjAxNDM4NDNlODM2YTNlY2Q4NzAzN2Q1OGM1NmIzOGZjNDcwZTgxMzQ4NDY5ZmJkYjEyMzZmZjNiYmE5ZmJmYTAwYjJhOTI2Y2Y1MjA2ZDExYjIxYjc2NjEzZTJhYTczMjUyN2VmZDNiNWJkNWIyNWQ1NTE0YzBiZGZjNGQ4ZDNlYTEwZWIxZDZiMjY0NzI1ODI4NGMxNWVjNzM1ZWIyZmVkYjk3MDAzZTA4OTBlZGM4MTdmOTRlMTg0M2QyOWFmMDQ4NzE0ZjA=", "domain": ".baidu.com",  "path": "/"})
    await page.setCookie({"name": "BAIDUID_BFESS", "value": "0A5E69D116549B192DE782D290D40725:FG=1", "domain": ".baidu.com",  "path": "/"})
    await page.setCookie({"name": "HMACCOUNT_BFESS", "value": "154B75413DE04015", "domain": ".hm.baidu.com",  "path": "/"})
    await page.setCookie({"name": "wordpress_sec_c31b215c0db6cdb6478d719de4022ec2", "value": "punkhead%7C1707361880%7CclCkkCHiFAaTm3LSeCiXx3xPcb3pMpnaHfqQ7sEypmm%7C710ce47eb2959ce587e4fcfe6451dc2fe9e4ce7c7c68c3f0d808cb27139d7bf7", "domain": "www.lgych.com", "path": "/wp-content/plugins"})
    await page.setCookie({"name": "_ga_EYK4RPLNVD", "value": "GS1.1.1706152196.1.1.1706152530.0.0.0", "domain": ".lgych.com",  "path": "/"})
    await page.setCookie({"name": "PHPSESSID", "value": "9isq3rm5acsl0763h263cf7pfb", "domain": "www.lgych.com",  "path": "/"})
    await page.setCookie({"name": "mycred_site_visit", "value": "1", "domain": "www.lgych.com",  "path": "/"})
    await page.setCookie({"name": "zh_choose", "value": "s", "domain": "www.lgych.com",  "path": "/"})
    await page.setCookie({"name": "__51vuft__K4Eg8SGElFhlWvHA", "value": "1706152195041", "domain": "www.lgych.com",  "path": "/"})
    await page.setCookie({"name": "erphp_login_tips", "value": "0", "domain": "www.lgych.com",  "path": "/"})
    await page.setCookie({"name": "__51uvsct__K4Eg8SGElFhlWvHA", "value": "1", "domain": "www.lgych.com",  "path": "/"})
    await page.setCookie({"name": "_ga", "value": "GA1.1.1822091633.1706152196", "domain": ".lgych.com",  "path": "/"})
    await page.setCookie({"name": "Hm_lpvt_7233eaff4ea4aa81ba9933f3a0e42474", "value": "1706152531", "domain": ".lgych.com",  "path": "/"})
    await page.setCookie({"name": "__vtins__K4Eg8SGElFhlWvHA", "value": "%7B%22sid%22%3A%20%22284042ed-d8aa-511b-b0b7-07c8d964a4c3%22%2C%20%22vd%22%3A%207%2C%20%22stt%22%3A%20335876%2C%20%22dr%22%3A%20221956%2C%20%22expires%22%3A%201706154330907%2C%20%22ct%22%3A%201706152530907%7D", "domain": "www.lgych.com",  "path": "/"})
    await page.setCookie({"name": "wordpress_logged_in_c31b215c0db6cdb6478d719de4022ec2", "value": "punkhead%7C1707361880%7CclCkkCHiFAaTm3LSeCiXx3xPcb3pMpnaHfqQ7sEypmm%7C1c7a708c9a1daf50b9f7e967d4f0b32764298cda61364fe6ba5b7b7ed2d84e6f", "domain": "www.lgych.com",  "path": "/"})
    await page.setCookie({"name": "Hm_lvt_7233eaff4ea4aa81ba9933f3a0e42474", "value": "1706152195", "domain": ".lgych.com",  "path": "/"})
    await page.setCookie({"name": "__51vcke__K4Eg8SGElFhlWvHA", "value": "108199df-bd58-5d56-b152-85bdb47b8278", "domain": "www.lgych.com",  "path": "/"})


    // await page.goto('https://www.lgych.com/wp-content/plugins/erphpdown/download.php?postid=66099&index=0');
    await page.goto('https://pan.baidu.com/share/init?surl=Hpjdd3otSQ7lC9hpPQPazQ&pwd=3p21');
    // await page.goto('https://www.lgych.com/42671.html');
    // await page.goto('https://moyin520.com/category/blu-ray/jp/page/3/');
    // Set screen size


    // Type into search box

    // const codeSelector = await page.waitForSelector('.erphpdown-copy');
    // const code = await codeSelector?.evaluate(el => el.getAttribute('data-clipboard-text'))
    // const searchResultSelector = await page.waitForSelector('.erphpdown-msg a');
    // const link = await searchResultSelector?.evaluate(el => el.href);
    // if (!link) throw Error('no link')
    // await page.goto(link);

    // Wait and click on first result
    // const submitSelector = await page.waitForSelector('#submitBtn');
    // if (!submitSelector) throw Error('no #submitBtn')
    await page.locator('#submitBtn').click();

    const fileSelector = await page.waitForSelector('div.file-name a.filename')
    const filename = await fileSelector?.evaluate(el => el.textContent);

    // await page.click(searchResultSelector);

    // await page.type('input.DocSearch-Input', 'window', { delay: 100 });

    // Locate the full title with a unique string
    // const elementSelector = await page.waitForSelector(
    //   '.erphpdown-cart a'
    // );
    // await page.locator('.erphpdown-cart a').click();
    // const link = await elementSelector?.evaluate(el => el.href);
    // if (!link) throw Error('no link')

    // const page2 = await browser.newPage();
    // await page2.setExtraHTTPHeaders({ "Cookie": cookie })
    // await page2.goto(link);
    // const title = page.title()
    // const selector = await page.waitForSelector(
    //   '.erphpdown-msg a'
    // )


    const pic = await page.screenshot({ encoding: 'base64' })
    const url = page.url()
    // res.send(`<img src="data:image/jpeg;base64,${pic}" /><p>${url}</p><p>${code}</p>`)

    // Print the full title
    // console.log('The title of this blog post is "%s".', fullTitle);
    
    res.send(`<img src="data:image/jpeg;base64,${pic}" /><p>${url}</p><p>filename: ${filename}</p>`)
    // await browser.close();
  } catch (e: any) {
    res.send(e.toString())
  } finally {

    console.log('ok')
  }

})



app.get('/list', async(req, res) => {
  let pageCount = 1
  try {
    const quaryUrl = new URL(req.url,`http://${req.headers.host}`)
    const cate = quaryUrl.searchParams.get('cate') || ''
    console.log({cate})
    console.log('connecting database...')
    await MongodbClient.connect()
    console.log('database connected.')
    while (true) {
      console.log('goto page number:', pageCount)
      const list = await getList(pageCount, cate)
      const collection = MongodbClient.db('original').collection(cate)
      // await collection.createIndex({id: 1}, {unique: true})
      await collection.insertMany(list, {ordered: false})
      pageCount++
    }

  } catch(e:any) {
    // console.log(e)
    console.log('done!')
    res.send(`<p>${e.toString()}</p><p>${pageCount}</p>`)
  } finally {
    await MongodbClient.close();
  }
})


async function getList(page: number, cate: string = 'bluray') {
  try {
    const url = `https://www.lgych.com/${cate}/page/${page}`
    console.log({url})
    const htmlRes = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    })
    if (htmlRes.status !== 200) throw Error(htmlRes.statusText)
    const dom = parse(htmlRes.data)
    const list = dom.querySelectorAll('div.post')

    const posts = []
    for (const li of list) {
      const id = li.getAttribute('data-id')
      const root = li.querySelector('div.img a')
      const href = root?.attributes.href
      const title = root?.attributes.title
      const cat = li.querySelector('div.cat a')?.textContent
      const fee = li.querySelector('span.fee')?.textContent
      posts.push({
        id,
        title,
        href,
        cat,
        fee,
        type: cate
      })
    }

    return posts
  }catch(e) {
    throw e
  }
} 



server.listen(PORT, () => {
  console.log(`Exercise-Master-Server is running successfully.`)
  console.log(`Port: ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})
