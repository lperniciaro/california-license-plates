#!/usr/bin/env node

const queries = process.argv.slice(2)
import chalk from 'chalk'
import { searchMultiple } from './lib/search.js'

async function main () {
  const results = await searchMultiple(queries)
  
  for (const { query, available } of results) {
    if (available) {
      console.log(chalk.green(query), chalk.gray('is available!'))
    } else {
      console.log(chalk.red(query), chalk.gray('is not available :['))
    }

    console.log()
    console.log({ query, available })
  }

  process.exit(0)
}

await main()