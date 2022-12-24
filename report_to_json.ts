import fs from 'fs'
import { parse } from 'csv-parse/sync';
import yargs from 'yargs'
import process from 'process'

/**
 * 森林簿CSVを樹木データJSONに変換する
 */

type Row = {
  id: number
  area: number
}

const rows: {[name: string]: Row[]}  = {}

const argv = yargs(process.argv.slice(2))
  .parseSync();

const input = argv._[0]
const output = argv._[1]

const csv = fs.readFileSync(input, 'utf-8');

// ヘッダ読み飛ばし
const records = parse(csv, {fromLine: 2}) as any[];

records
  .map(record => {
    const id = record[0] as string
    if (!rows[id]) {
      rows[id] = []
    }

    if (record[2]) {
      rows[id].push({id: Number(record[2]), area: Number(record[1])})
    }
    if (record[4]) {
      rows[id].push({id: Number(record[4]), area: Number(record[3])})
    } 
    if (record[6]) {
      rows[id].push({id: Number(record[6]), area: Number(record[5])})
    } 
  })

const results: {id: string, area: {[treeId: number]: number}}[] = [] 

Object.keys(rows).forEach(id => {
  const treeIds = rows[id]
  const dict: {[id: number]: number} = {}

  treeIds.map(n => {
    if (dict[n.id]) {
      dict[n.id] += n.area
    }else {
      dict[n.id] = n.area
    }
  })

  treeIds.map(n => {
    dict[n.id] = Number(dict[n.id].toFixed((3)))
  })

  results.push({
    'id': id,
    'area': dict
  })
})

fs.writeFileSync(output, JSON.stringify(results))

