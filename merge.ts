import fs from 'fs'
import { parse } from 'csv-parse/sync';
import { Feature, FeatureCollection, GeoJSON, MultiPolygon } from 'geojson';


type TreeId = {
  id: string
  data: {[n: string]: number}
}


const inputA = fs.readFileSync('./out/treeId.json', 'utf-8');
const inputB = fs.readFileSync('./data/hayashi.geojson', 'utf-8');

const treeIds = JSON.parse(inputA) as TreeId[]
const geoJson = JSON.parse(inputB) as FeatureCollection<MultiPolygon, {id: number}>

const features: Feature<MultiPolygon, {id: number, data: {[n: number]: number}}>[] = []

treeIds.map(treeId => {
  const feature = geoJson.features.find(f => {
    return f.properties.id === Number(treeId.id)
  })
  if (feature) {
    features.push({
      ...feature,
      properties: {id: Number(treeId.id), data: treeId.data}
    })
  }
})
geoJson.features = features
const e = {
  ...geoJson,
  features: features
}
fs.writeFileSync('./out/treeKind.geojson', JSON.stringify(e))


