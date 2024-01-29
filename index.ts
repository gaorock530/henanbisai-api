import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import fs from 'fs'
// import {
//   readFile,
//   writeFile
// } from 'node:fs/promises'
import cookieParser from 'cookie-parser'
import parse from 'node-html-parser'
import puppeteer from 'puppeteer-core'
import https from 'https'
import axios from 'axios'
import MongodbClient from './database'
import pan_cookie from './cookies/panCookie'
import lan_cookie from './cookies/lanCookie'

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

const temphtml = {
  string: '',
}

app.get('/', (req, res) => {
  res.json({ status: 'template server ready' })
})

app.get('/parse', async (req, res) => {
  try {
    const q = req.query.q

    if (!q) return res.json({ error: 'no q' })
    const parsed = await parseDetailPage(q as string, false)

    res.json(parsed)
  } catch (e: any) {
    res.json({ error: e.toString() })
    return e
  }

})

app.get('/share', async (req, res) => {
  let page
  try {
    const browser = await puppeteer.launch({ executablePath: "C:/Program\ Files/Google/Chrome/Application/chrome.exe", headless: false });
    page = await browser.newPage();
    for (const co of pan_cookie) {
      const part = co.split('	')
      await page.setCookie({ "name": part[0], "value": part[1], "domain": part[2], "path": part[3] })
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
  } catch (e: any) {
    console.log(e)
    res.send(e.toString())
  } finally {


  }
})

const chrome = ["C:/Program\ Files\ (x86)/Google/Chrome/Application/chrome.exe", "C:/Program\ Files/Google/Chrome/Application/chrome.exe"]



app.get('/u', async (req, res) => {
  // const cookie = 'PHPSESSID=5dsbimkv6pu4rgnga42rthbsco; __51vcke__K4Eg8SGElFhlWvHA=c02e95a2-c4ca-5172-811e-0ea49a7d1a97; __51vuft__K4Eg8SGElFhlWvHA=1685164511733; _ga_JPNTDP3XJE=GS1.1.1685766273.15.0.1685766273.0.0.0; Hm_lvt_20dbded09f6ac464b84faec7ab3a278b=1691308021; Hm_lpvt_20dbded09f6ac464b84faec7ab3a278b=1693593774; _ga=GA1.1.519116480.1643790333; wordpress_test_cookie=WP%20Cookie%20check; Hm_lvt_7233eaff4ea4aa81ba9933f3a0e42474=1704983825; zh_choose=s; mbt_theme_night=1; __51uvsct__K4Eg8SGElFhlWvHA=121; wordpress_logged_in_c31b215c0db6cdb6478d719de4022ec2=punkhead%7C1707320021%7CM02SU7z2vZqHq9yHpEx1SHPPBPOi5uATaXKFqwk2f3j%7C56450092bbebe6eb525e204c4d262047ddc9e8e6594e0a231766d888b4bb990c; erphp_login_tips=1; mycred_site_visit=1; Hm_lpvt_7233eaff4ea4aa81ba9933f3a0e42474=1706110520; __vtins__K4Eg8SGElFhlWvHA=%7B%22sid%22%3A%20%2222b1297c-7a41-5536-a739-2b7f6a1b325b%22%2C%20%22vd%22%3A%207%2C%20%22stt%22%3A%20109438%2C%20%22dr%22%3A%2066263%2C%20%22expires%22%3A%201706111999999%2C%20%22ct%22%3A%201706110520110%7D; _ga_EYK4RPLNVD=GS1.1.1706110410.59.1.1706110609.0.0.0'
  // const cookie2 = 'zh_choose=s; wordpress_sec_c31b215c0db6cdb6478d719de4022ec2=punkhead%7C1707320021%7CM02SU7z2vZqHq9yHpEx1SHPPBPOi5uATaXKFqwk2f3j%7C508acdd62ae3dab934d235cf6dd83b5a645956538f80917961b82484a9a4f6bb; PHPSESSID=5dsbimkv6pu4rgnga42rthbsco; __51vcke__K4Eg8SGElFhlWvHA=c02e95a2-c4ca-5172-811e-0ea49a7d1a97; __51vuft__K4Eg8SGElFhlWvHA=1685164511733; _ga_JPNTDP3XJE=GS1.1.1685766273.15.0.1685766273.0.0.0; Hm_lvt_20dbded09f6ac464b84faec7ab3a278b=1691308021; Hm_lpvt_20dbded09f6ac464b84faec7ab3a278b=1693593774; _ga=GA1.1.519116480.1643790333; wordpress_test_cookie=WP%20Cookie%20check; Hm_lvt_7233eaff4ea4aa81ba9933f3a0e42474=1704983825; zh_choose=s; mbt_theme_night=1; wordpress_logged_in_c31b215c0db6cdb6478d719de4022ec2=punkhead%7C1707320021%7CM02SU7z2vZqHq9yHpEx1SHPPBPOi5uATaXKFqwk2f3j%7C56450092bbebe6eb525e204c4d262047ddc9e8e6594e0a231766d888b4bb990c; erphp_login_tips=1; mycred_site_visit=1; __vtins__K4Eg8SGElFhlWvHA=%7B%22sid%22%3A%20%228e70dd77-5e13-5c2a-82de-cfcf3ae00709%22%2C%20%22vd%22%3A%201%2C%20%22stt%22%3A%200%2C%20%22dr%22%3A%200%2C%20%22expires%22%3A%201706113878450%2C%20%22ct%22%3A%201706112078450%7D; __51uvsct__K4Eg8SGElFhlWvHA=122; Hm_lpvt_7233eaff4ea4aa81ba9933f3a0e42474=1706112079; _ga_EYK4RPLNVD=GS1.1.1706110410.59.1.1706112250.0.0.0'
  try {
    const browser = await puppeteer.launch({ executablePath: chrome[0], headless: false });
    // const browser = await puppeteer.launch({ executablePath: "C:/Program\ Files\ (x86)/Google/Chrome/Application/chrome.exe", headless: "new" });
    // const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    // await page.setViewport({ width: 1080, height: 1024 });
    // Navigate the page to a URL
    // await page.setExtraHTTPHeaders({ "Cookie": cookie2 })
    await page.setCookie({ "name": "zh_choose", "value": "s", "domain": "www.lgych.com", "path": "/wp-content/plugins" })
    await page.setCookie({ "name": "ab_sr", "value": "1.0.1_NTAyZWFiNTIyMGY2NGFlODc5MWNmZTBkNjAxNDM4NDNlODM2YTNlY2Q4NzAzN2Q1OGM1NmIzOGZjNDcwZTgxMzQ4NDY5ZmJkYjEyMzZmZjNiYmE5ZmJmYTAwYjJhOTI2Y2Y1MjA2ZDExYjIxYjc2NjEzZTJhYTczMjUyN2VmZDNiNWJkNWIyNWQ1NTE0YzBiZGZjNGQ4ZDNlYTEwZWIxZDZiMjY0NzI1ODI4NGMxNWVjNzM1ZWIyZmVkYjk3MDAzZTA4OTBlZGM4MTdmOTRlMTg0M2QyOWFmMDQ4NzE0ZjA=", "domain": ".baidu.com", "path": "/" })
    await page.setCookie({ "name": "BAIDUID_BFESS", "value": "0A5E69D116549B192DE782D290D40725:FG=1", "domain": ".baidu.com", "path": "/" })
    await page.setCookie({ "name": "HMACCOUNT_BFESS", "value": "154B75413DE04015", "domain": ".hm.baidu.com", "path": "/" })
    await page.setCookie({ "name": "wordpress_sec_c31b215c0db6cdb6478d719de4022ec2", "value": "punkhead%7C1707361880%7CclCkkCHiFAaTm3LSeCiXx3xPcb3pMpnaHfqQ7sEypmm%7C710ce47eb2959ce587e4fcfe6451dc2fe9e4ce7c7c68c3f0d808cb27139d7bf7", "domain": "www.lgych.com", "path": "/wp-content/plugins" })
    await page.setCookie({ "name": "_ga_EYK4RPLNVD", "value": "GS1.1.1706152196.1.1.1706152530.0.0.0", "domain": ".lgych.com", "path": "/" })
    await page.setCookie({ "name": "PHPSESSID", "value": "9isq3rm5acsl0763h263cf7pfb", "domain": "www.lgych.com", "path": "/" })
    await page.setCookie({ "name": "mycred_site_visit", "value": "1", "domain": "www.lgych.com", "path": "/" })
    await page.setCookie({ "name": "zh_choose", "value": "s", "domain": "www.lgych.com", "path": "/" })
    await page.setCookie({ "name": "__51vuft__K4Eg8SGElFhlWvHA", "value": "1706152195041", "domain": "www.lgych.com", "path": "/" })
    await page.setCookie({ "name": "erphp_login_tips", "value": "0", "domain": "www.lgych.com", "path": "/" })
    await page.setCookie({ "name": "__51uvsct__K4Eg8SGElFhlWvHA", "value": "1", "domain": "www.lgych.com", "path": "/" })
    await page.setCookie({ "name": "_ga", "value": "GA1.1.1822091633.1706152196", "domain": ".lgych.com", "path": "/" })
    await page.setCookie({ "name": "Hm_lpvt_7233eaff4ea4aa81ba9933f3a0e42474", "value": "1706152531", "domain": ".lgych.com", "path": "/" })
    await page.setCookie({ "name": "__vtins__K4Eg8SGElFhlWvHA", "value": "%7B%22sid%22%3A%20%22284042ed-d8aa-511b-b0b7-07c8d964a4c3%22%2C%20%22vd%22%3A%207%2C%20%22stt%22%3A%20335876%2C%20%22dr%22%3A%20221956%2C%20%22expires%22%3A%201706154330907%2C%20%22ct%22%3A%201706152530907%7D", "domain": "www.lgych.com", "path": "/" })
    await page.setCookie({ "name": "wordpress_logged_in_c31b215c0db6cdb6478d719de4022ec2", "value": "punkhead%7C1707361880%7CclCkkCHiFAaTm3LSeCiXx3xPcb3pMpnaHfqQ7sEypmm%7C1c7a708c9a1daf50b9f7e967d4f0b32764298cda61364fe6ba5b7b7ed2d84e6f", "domain": "www.lgych.com", "path": "/" })
    await page.setCookie({ "name": "Hm_lvt_7233eaff4ea4aa81ba9933f3a0e42474", "value": "1706152195", "domain": ".lgych.com", "path": "/" })
    await page.setCookie({ "name": "__51vcke__K4Eg8SGElFhlWvHA", "value": "108199df-bd58-5d56-b152-85bdb47b8278", "domain": "www.lgych.com", "path": "/" })


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

app.get('/parse/v1', async (req, res) => {


  try {
    const quaryUrl = new URL(req.url, `http://${req.headers.host}`)
    const collection = quaryUrl.searchParams.get('collection') || ''
    console.log({ collection })
    console.log('connecting database...')
    await MongodbClient.connect()
    console.log('database connected.')

    const originalCollection = MongodbClient.db('original').collection(collection)
    const organizedCollection = MongodbClient.db('organized').collection(collection)

    let count = 0

    async function transfer() {
      const doc = await originalCollection.findOne({}, { skip: count })
      if (!doc) return

      const parsedObj: any = await parseDetailPage(doc.href, collection === 'free')
      // do something
      const very = Math.random() + 1
      const saved = await organizedCollection.insertOne({ ...doc, ...parsedObj, popularity: Math.round(doc.down * very), originalTitle: doc.title })
      // done
      count++
      console.log({ count, saved: saved.acknowledged })

      await transfer()
    }

    await transfer()
    res.json({ status: 'done', total: count })


  } catch (e: any) {
    res.send(e.toString())
  } finally {
    await MongodbClient.close();
    console.log('database closed.')
  }

})


async function parseDetailPage(url: string, free: boolean) {
  try {
    const htmlRes = await axios.get(url, {
      headers: {
        Cookie: lan_cookie,
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    })
    if (htmlRes.status !== 200) throw Error(htmlRes.statusText)
    temphtml.string = htmlRes.data
    // parse response html string into dom
    const dom = parse(temphtml.string)

    // get title & tags
    let title = dom.querySelector('.article-title')?.innerText

    let year = null, bad = null

    const sYear = title?.match(/[\[?](\d{4})[\]?]/)
    if (sYear && sYear[0]) {
      // if (sYear[0].length === 6) year = sYear[0].slice(1, -1)
      year = sYear[1].trim()
      title = title?.replace(/[\[?](\d{4})[\]?]/, '')
    }

    const tag = title?.match(/[\[\《].+[\]\》]/ig)
    let size = null, tags
    if (tag) {
      title = title?.replace(tag[0], '')
      const lis = tag[0].slice(1, -1).split(' ')
      const item = lis.filter(t => t.trim().match(/\d+\.?\d+(M|MB|G|GB){1}/ig))
      if (item && item[0]) size = item[0].replace(/([M|G]$)/, "$1B")
      else bad = true
      tags = lis.filter(t => !t.match(/\d+\.?\d+(M|MB|G|GB){1}/ig))
    }


    if (!year) {
      const findYear = title?.match(/\s\[?\d{4}\s|\]?$/)
      if (findYear && findYear[0]) {
        year = findYear[0].trim()
        // if (title && (Number(findYear[1]) + findYear[0].length) > title.length) title = title?.replace(/\s\[?\d{4}\s|\]?$/, '')
      }
    }


    // get content
    let introductionNodes = dom.querySelectorAll(
      'div.article-content>p'
    )

    if (introductionNodes.length === 0) introductionNodes = dom.querySelectorAll(
      'div.article-content>div'
    )


    let htmlContent = ''
    for (const p of introductionNodes) {
      let need = true
      for (const node of p.childNodes) {
        // 1 - ELEMENT_NODE, 3 - TEXT_NODE
        if (node.toString().match(/\<img/ig)) {
          need = false
          break
        }
      }
      if (need) htmlContent = htmlContent.concat(`<p>${p.innerHTML}</p>`)
    }


    // get all pictures 
    let photos = dom.querySelectorAll('.article-content img')
    const urls = []
    for (const img of photos) {
      if (img.getAttribute('src')) urls.push(img.getAttribute('src'))
    }


    // get download link
    const downlaod_link_inital = free ? dom.querySelector('.erphpdown-box .erphpdown-cart a.down') : dom.querySelector('.erphpdown-box .erphpdown-cart a.down.bought')


    return {
      title: title?.trim(),
      year,
      tags,
      size,
      content: htmlContent,
      images: urls,
      link: downlaod_link_inital ? downlaod_link_inital.getAttribute('href') : null,
      bad
    }
  } catch (e: any) {
    console.log(e.toString())
    return null
  }
}



app.get('/list', async (req, res) => {
  let pageCount = 1
  try {
    const quaryUrl = new URL(req.url, `http://${req.headers.host}`)
    const cate = quaryUrl.searchParams.get('cate') || ''
    console.log({ cate })
    console.log('connecting database...')
    await MongodbClient.connect()
    console.log('database connected.')
    while (true) {
      console.log('goto page number:', pageCount)
      const list = await getList(pageCount, cate)
      const collection = MongodbClient.db('original').collection(cate)
      // await collection.createIndex({id: 1}, {unique: true})
      await collection.insertMany(list, { ordered: false })
      pageCount++
    }

  } catch (e: any) {
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
    console.log({ url })
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
      const category = li.querySelector('div.cat a')?.textContent.trim()
      const fee = li.querySelector('span.fee')?.textContent.trim()
      const down = li.querySelector('span.downs')?.textContent.trim()
      const label = li.querySelector('span.post-sign')?.textContent.trim()
      posts.push({
        id,
        title,
        href,
        category,
        fee: Number(fee),
        down: Number(down),
        label,
        type: cate
      })
    }

    return posts
  } catch (e) {
    throw e
  }
}



server.listen(PORT, () => {
  console.log(`Exercise-Master-Server is running successfully.`)
  console.log(`Port: ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})
