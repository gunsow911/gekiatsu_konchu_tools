filepaths=`ls ./data/forest_reports/*.csv`
for filepath in $filepaths
do
    filename=$(basename $filepath .csv)
    $(ts-node ./report_to_json.ts $filepath ./out/forest_reports/$filename.json)
    $(ts-node ./merge.ts ./out/forest_reports/$filename.json ./data/geojsons/$filename.geojson ./out/geojsons/$filename.geojson)
done
