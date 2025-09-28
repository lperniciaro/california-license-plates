import prime from './prime.js'
const host = 'https://www.dmv.ca.gov/wasapp/ipp2/'

async function search (query) {
  const { browser, context, page } = await prime(query)
  
  await page.click('#checkAvailable7')
  
  // Wait 3 seconds for page to load results
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  const $success = await page.$('text=Congratulations - This plate can be requested!')
  const $error = await page.$('.plate-not-found.alert.alert--error')
  
  const successVisible = $success ? await $success.isVisible() : false
  const errorVisible = $error ? await $error.isVisible() : false
  
  
  const available = !errorVisible && successVisible
  const image = await page.$('img[src^="showPlateImage.do"]')
  let src = await image?.getAttribute('src')

  if (src && !src.startsWith('http')) src = host + src

  // await context.close()
  // await browser.close()

  return {
    query,
    available,
    src
  }
}

export default search
