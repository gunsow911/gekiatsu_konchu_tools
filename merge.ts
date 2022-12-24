import fs from 'fs'
import { Feature, FeatureCollection, GeoJSON, MultiPolygon } from 'geojson';
import yargs from 'yargs'

/**
 * シェープファイルからエクスポートしたGeoJSONに樹林簿データをマージする 
 */

type TreeId = {
  id: string
  area: {[n: string]: number}
}


const argv = yargs(process.argv.slice(2))
  .parseSync();

const reportInput = fs.readFileSync(argv._[0], 'utf-8');
const geoJsonInput = fs.readFileSync(argv._[1], 'utf-8');

const treeIds = JSON.parse(reportInput) as TreeId[]
const geoJson = JSON.parse(geoJsonInput) as FeatureCollection<MultiPolygon, {林班: number}>

const features: Feature<MultiPolygon, {id: number, data: {[n: number]: number}}>[] = []

treeIds.map(treeId => {
  const feature = geoJson.features.find(f => {
    return f.properties.林班 === Number(treeId.id)
  })
  if (feature) {

    // 精度を削減
    const coordinates = feature.geometry.coordinates.map((a) => {
      return a.map((b) => {
        return b.map((c) => {
           return [Number(c[0].toFixed(4)), Number(c[1].toFixed(4))]
        })
      })
    }) 

    features.push({
      ...feature,
      geometry: {
        ...feature.geometry,
        coordinates: coordinates
      },
      properties: {id: Number(treeId.id), data: treeId.area}
    })
  }
})
const e = {
  ...geoJson,
  features: features
}
fs.writeFileSync(argv._[2], JSON.stringify(e))

