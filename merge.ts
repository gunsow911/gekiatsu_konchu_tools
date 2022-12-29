import fs from 'fs'
import { Feature, FeatureCollection, GeoJSON, MultiPolygon } from 'geojson';
import yargs from 'yargs'
import centroid from '@turf/centroid'
import simplify from '@turf/simplify'

/**
 * シェープファイルからエクスポートしたGeoJSONに樹林簿データをマージする 
 */

type TreeId = {
  id: string
  area: {[n: string]: number}
}

type TreeReportProperties = {
  id: number
  data: {[n: number]: number}
  centroid: {lat: number, lng: number}
}


const argv = yargs(process.argv.slice(2))
  .parseSync();

const reportInput = fs.readFileSync(argv._[0], 'utf-8');
const geoJsonInput = fs.readFileSync(argv._[1], 'utf-8');

const treeIds = JSON.parse(reportInput) as TreeId[]
const geoJson = JSON.parse(geoJsonInput) as FeatureCollection<MultiPolygon, {林班: number}>

const features: Feature<MultiPolygon, TreeReportProperties>[] = []

treeIds.map(treeId => {
  const feature = geoJson.features.find(f => {
    return f.properties.林班 === Number(treeId.id)
  })
  if (feature) {

    // 精度
    const accuracy = 4

    // 重心
    const centroidFeature = centroid(feature)
    const centroidLatLng = {
      lat: Number(centroidFeature.geometry.coordinates[1].toFixed(accuracy)),
      lng: Number(centroidFeature.geometry.coordinates[0].toFixed(accuracy)),
    }

    // 簡略化の度合
    const tolerance = 0.0001 
    simplify(feature, {tolerance: tolerance, highQuality:true, mutate:true})
    const coordinates = feature.geometry.coordinates.map((a) => {
      return a.map((b) => {
        return b.map((c) => {
           return [Number(c[0].toFixed(accuracy)), Number(c[1].toFixed(accuracy))]
        })
      })
    }) 


    features.push({
      ...feature,
      geometry: {
        ...feature.geometry,
        coordinates: coordinates
      },
      properties: {
        id: Number(treeId.id),
        data: treeId.area,
        centroid: centroidLatLng,
      }
    })
  }
})
const e = {
  ...geoJson,
  features: features
}
fs.writeFileSync(argv._[2], JSON.stringify(e))

