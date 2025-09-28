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

  return {
    query,
    available,
    src,
    browser,
    context,
    page
  }
}

async function searchMultiple(queries) {
  let browser, context, page
  const results = []
  
  for (let i = 0; i < queries.length; i++) {
    const query = queries[i]
    
    if (i === 0) {
      // First query - use prime to set up
      const result = await search(query)
      results.push(result)
      browser = result.browser
      context = result.context
      page = result.page
    } else {
      // Subsequent queries - clear and enter new text
      await page.click('#plateChar6')
      
      // Clear existing text (backspace 7 times)
      for (let j = 0; j < 7; j++) {
        // await new Promise(resolve => setTimeout(resolve, 300))
        await page.keyboard.press('Backspace')
      }
      
      // Enter new query
      await new Promise(resolve => setTimeout(resolve, 300))
      for (const character of query) {
        await new Promise(resolve => setTimeout(resolve, 300))
        await page.keyboard.type(character)
      }
      
      // Check availability
      await page.click('#checkAvailable7')
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const $success = await page.$('text=Congratulations - This plate can be requested!')
      const $error = await page.$('.plate-not-found.alert.alert--error')
      
      const successVisible = $success ? await $success.isVisible() : false
      const errorVisible = $error ? await $error.isVisible() : false
      
      const available = !errorVisible && successVisible
      const image = await page.$('img[src^="showPlateImage.do"]')
      let src = await image?.getAttribute('src')
      
      if (src && !src.startsWith('http')) src = host + src
      
      results.push({
        query,
        available,
        src
      })
    }
  }
  
  await context.close()
  await browser.close()
  
  return results
}

export default search
export { searchMultiple }
