import { sleep, check, group, fail } from 'k6'
import http from 'k6/http'
import jsonpath from 'https://jslib.k6.io/jsonpath/1.0.2/index.js'

export const options = {
  cloud: {
    distribution: { 'amazon:us:ashburn': { loadZone: 'amazon:us:ashburn', percent: 100 } },
    apm: [],
  },
  thresholds: {},
  scenarios: {
    Buy_pizza: {
      executor: 'ramping-vus',
      gracefulStop: '30s',
      stages: [
        { target: 5, duration: '30s' },
        { target: 15, duration: '1m' },
        { target: 10, duration: '30s' },
        { target: 0, duration: '30s' },
      ],
      gracefulRampDown: '30s',
      exec: 'buy_pizza',
    },
  },
}

export function buy_pizza() {
  let response
  const vars = {}

  group('Buy Pizza - https://pizza.trevorscs329.click/', function () {
    // Homepage
    response = http.get('https://pizza.trevorscs329.click/', {
      headers: {
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'max-age=0',
        'if-modified-since': 'Tue, 28 Oct 2025 22:13:36 GMT',
        'if-none-match': '"a8c246e9ee4c429dcd67a8ad372e5afb"',
        priority: 'u=0, i',
        'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
      },
    })
    sleep(2)

    // Login
    response = http.put(
      'https://pizza-service.trevorscs329.click/api/auth',
      '{"email":"a@jwt.com","password":"admin"}',
      {
        headers: {
          accept: '*/*',
          'accept-encoding': 'gzip, deflate, br, zstd',
          'accept-language': 'en-US,en;q=0.9',
          'content-type': 'application/json',
          origin: 'https://pizza.trevorscs329.click',
          priority: 'u=1, i',
          'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-site',
        },
      }
    )

    if (!check(response, { 'status equals 200': r => r.status.toString() === '200' })) {
      console.log(response.body)
      fail('Login was *not* 200')
    }

    vars['token1'] = jsonpath.query(response.json(), '$.token')[0]
    sleep(2.5)

    // Menu
    response = http.get('https://pizza-service.trevorscs329.click/api/order/menu', {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9',
        authorization: `Bearer ${vars['token1']}`,
        'content-type': 'application/json',
        origin: 'https://pizza.trevorscs329.click',
        priority: 'u=1, i',
        'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
      },
    })

    vars['title1'] = jsonpath.query(response.json(), '$[4].title')[0]

    // franchise
    response = http.get(
      'https://pizza-service.trevorscs329.click/api/franchise?page=0&limit=20&name=*',
      {
        headers: {
          accept: '*/*',
          'accept-encoding': 'gzip, deflate, br, zstd',
          'accept-language': 'en-US,en;q=0.9',
          authorization: `Bearer ${vars['token1']}`,
          'content-type': 'application/json',
          origin: 'https://pizza.trevorscs329.click',
          priority: 'u=1, i',
          'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-site',
        },
      }
    )
    sleep(2)

    // me
    response = http.get('https://pizza-service.trevorscs329.click/api/user/me', {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9',
        authorization: `Bearer ${vars['token1']}`,
        'content-type': 'application/json',
        origin: 'https://pizza.trevorscs329.click',
        priority: 'u=1, i',
        'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
      },
    })
    sleep(1.5)

    // order
    response = http.post(
      'https://pizza-service.trevorscs329.click/api/order',
      `{"items":[{"menuId":2,"description":"Pepperoni","price":0.0042},{"menuId":5,"description":"${vars['title1']}","price":0.0099}],"storeId":"1","franchiseId":1}`,
      {
        headers: {
          accept: '*/*',
          'accept-encoding': 'gzip, deflate, br, zstd',
          'accept-language': 'en-US,en;q=0.9',
          authorization: `Bearer ${vars['token1']}`,
          'content-type': 'application/json',
          origin: 'https://pizza.trevorscs329.click',
          priority: 'u=1, i',
          'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-site',
        },
      }
    )
    sleep(2)

    // verify
    response = http.post(
      'https://pizza-factory.cs329.click/api/order/verify',
      '{"jwt":"eyJpYXQiOjE3NjM2NjE5MjcsImV4cCI6MTc2Mzc0ODMyNywiaXNzIjoiY3MzMjkuY2xpY2siLCJhbGciOiJSUzI1NiIsImtpZCI6Ik9TcF94VzhlM3kwNk1KS3ZIeW9sRFZMaXZXX2hnTWxhcFZSUVFQVndiY0UifQ.eyJ2ZW5kb3IiOnsiaWQiOiJ0d2F0dGxlcyIsIm5hbWUiOiJUcmV2b3IgV2F0dGxlcyJ9LCJkaW5lciI6eyJpZCI6MSwibmFtZSI6IuW4uOeUqOWQjeWtlyIsImVtYWlsIjoiYUBqd3QuY29tIn0sIm9yZGVyIjp7Iml0ZW1zIjpbeyJtZW51SWQiOjIsImRlc2NyaXB0aW9uIjoiUGVwcGVyb25pIiwicHJpY2UiOjAuMDA0Mn0seyJtZW51SWQiOjUsImRlc2NyaXB0aW9uIjoiQ2hhcnJlZCBMZW9wYXJkIiwicHJpY2UiOjAuMDA5OX1dLCJzdG9yZUlkIjoiMSIsImZyYW5jaGlzZUlkIjoxLCJpZCI6MzAxfX0.Bk8Gcf-PKN2S1l6choLyqzOtERGovCI4-jkm4s0DslT9Pl6ICQEun_KUeh9xatXNFb76LNz18rq00JWShW5iqrmO_NNe11ruPaJ4lv0xYDq7nGoBO3bBmC4B3veroFnxKv5uC5ckqu6IlywV2S2z2EWkIxOCx8Y4zPshyAdFC0CB8-p8oOUdVWDIns-9RNDC8y-HpCuuWW_7JTy-fabESAq7tFfNqbJqqfL_VdG6IDCfSWj-3Dxs0JZBXdboOt5SDhO6EiT9kPUlKQPIM4DstJLfcgcQGaij6TOP1Qysni6q7OCO0i-_TEDMURc-V_s8XC2mDVTf01Pt_OeG34TaDXvfMho8kJU_EOspgOVkKMpn6OWQC_GS65L3F8fSzMe8LTfaaMrNeAae7As9APovGNJCsstGZVXEY5V-UdgdG8rWdDTqJ67QEcFv9mnIWPyBMtAirA3odfc1tnZLqWigi7CgpOmXHyOLZYGtcsKkn4wgHBAYo_-e9gpWo7oi3i6iK0oHOfsQTLnrNX8szYD0H5mdAYAPGGBDRHDEr3BhBedngOT72yOq25XZ-0-HT-0IKdS4AfvDAMMJA-cDHpPZZqqLki4KwLBr0JMLvBa24AEgcfIRUtedKdxxWAMaecdmzOicRqrzrvDr-GLc-xzu5i3foj8F-NlXCnjJMm6RT3w"}',
      {
        headers: {
          accept: '*/*',
          'accept-encoding': 'gzip, deflate, br, zstd',
          'accept-language': 'en-US,en;q=0.9',
          authorization: `Bearer ${vars['token1']}`,
          'content-type': 'application/json',
          origin: 'https://pizza.trevorscs329.click',
          priority: 'u=1, i',
          'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'cross-site',
          'sec-fetch-storage-access': 'active',
        },
      }
    )
    sleep(2)
  })
}
