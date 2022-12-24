import fs from 'fs'
import { parse } from 'csv-parse/sync';

/**
 * 森林簿CSVを樹木データJSONに変換する
 */

type Row = {
  id: number
  area: number
}

const rows: {[name: string]: Row[]}  = {}

const csv = fs.readFileSync('./data/forest_report.csv', 'utf-8');
const records = parse(csv) as any[];

records
  .map(record => {
    const id = record[0] as string
    if (!rows[id]) {
      rows[id] = []
    }

    if (record[2]) {
      rows[id].push({id: record[2], area: Number(record[1])})
    }
    if (record[4]) {
      rows[id].push({id: record[4], area: Number(record[3])})
    } 
    if (record[6]) {
      rows[id].push({id: record[6], area: Number(record[5])})
    } 
  })

  const results: any[] = []

  Object.keys(rows).forEach(id => {
    const treeIds = rows[id]
    const dict: {[name: string]: number} = {}
    // console.log(treeIds)

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

    const a = {
      'id': id,
      'data': dict
    }
    results.push(a)
  })

  fs.writeFileSync('./out/treeId.json', JSON.stringify(results))

