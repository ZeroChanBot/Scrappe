let axios = require('axios')
let cheerio = require('cheerio')
let got = require('got')
let getCookies = {
	"cookie": 'wmid=142420656; user_type=1; country=id; session_key=2a5d97d05dc8fe238150184eaf3519ad;'
}

if (!getCookies.cookie) getCookies = {}

async function tiktok(url) {
	return new Promise (async (resolve, reject) => {
		try {
			let RegToktok = url.match(/(?:http(?:s|):\/\/|)(?:www\.|)tiktok.com\/@([-_0-9A-Za-z]{3,14})\/video\/([0-9]{8,50})(?:\?is_copy_url=0&is_from_webapp=v1&sender_device=pc&sender_web_id=(?:[0-9]{8,50}))|(?:http(?:s|):\/\/|)(?:vt\.tiktok\.com\/([-_0-9A-Za-z]{3,14}))/g)
			if (!RegToktok) return reject(new Error(String('Url Invalid')))
			const data = await axios({
				url: "https://musicaldown.com/id",
				method: "GET",
				headers: {
					'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36',
				}
			})
			const $ = cheerio.load(data.data)
			let FORM = {
				[`${$("#link_url").attr("name")}`]: url,
				[`${$("#submit-form > div").find("div:nth-child(1) > input[type=hidden]:nth-child(2)").attr("name")}`]: $("#submit-form > div").find("div:nth-child(1) > input[type=hidden]:nth-child(2)").attr("value"),
				verify: $("#submit-form > div").find("div:nth-child(1) > input[type=hidden]:nth-child(3)").attr("value")
			}
			const getPost = await axios({
				url: "https://musicaldown.com/id/download",
				method: "POST",
				headers: {
					'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36',
					"cookie": data.headers["set-cookie"].join("")
				},
				data: new URLSearchParams(Object.entries(FORM))
			})
			const c = cheerio.load(getPost.data)
			const Format = {
				nowm: c("body > div.welcome.section > div").find("div:nth-child(2) > div.col.s12.l8 > a:nth-child(4)").attr("href"),
				mp4: c("body > div.welcome.section").find("div > div:nth-child(2) > div.col.s12.l8 > a:nth-child(6)").attr("href"),
				original: c("body > div.welcome.section > div").find("div:nth-child(2) > div.col.s12.l8 > a:nth-child(8)").attr("href")
			}
			return resolve(Format)
		} catch(err) {
			throw reject(new Error(String(err)))
		}
	})
}

module.exports = tiktok