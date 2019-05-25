const functions = require('firebase-functions');
const polyline = require('google-polyline');
const admin = require('firebase-admin');
const Math = require('mathjs')
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();
// const googleMapsClient = require('@google/maps').createClient({
//     key: 'AIzaSyAyKF-HG17K9PNqUveRKsY4d55_mfjDzh4'
// });
const geolib = require('geolib');

// var start = {
//     latitude: 51.5103,
//     longitude: 7.49347
// }
exports.arrivalTime = functions.https.onRequest(async(req, res) => {
    const trainRunId = req.body.trainRunId;
    const trainRunDoc = await db.doc("train_run/" + trainRunId).get();
    const time = trainRunDoc.data().current_location.time_stamp._seconds;
    //const time = appendLeadingZeros(date.getHours()) + ":" + appendLeadingZeros(date.getMinutes()) + ":" + appendLeadingZeros(date.getSeconds());
    //res.status(200).json(time);

    const previousLocationsAll = trainRunDoc.data().previous_locations;

    const start = {
        latitude: trainRunDoc.data().current_location.location._latitude,
        longitude: trainRunDoc.data().current_location.location._longitude
    }

    const end = {
        latitude: req.body.end._latitude,
        longitude: req.body.end._longitude
    }

    const path = [
        [79.8505210876465, 6.93349874935266],
        [79.8662281036377, 6.92957939492207],
        [79.8791670799255, 6.93750327346625], //in previous
        [79.894552230835, 6.96112501199875],
        [79.8991870880127, 6.97533156282076],
        [79.9003028869629, 6.98751434863466],
        [79.9068260192871, 7.00020796253534],
        [79.9182415008545, 7.01656432490157],
        [79.9214601516724, 7.02925714765386],
        [79.931116104126, 7.04731613665995],
        [79.9371242523193, 7.05506765677165],
        [79.9457502365112, 7.06618362115098],
        [79.9605774879456, 7.06850473707687],
        [79.9737739562988, 7.07468012633111],
        [79.9936866760254, 7.09416400233892],
        [80.0104665756226, 7.10711020945972],
        [80.0203800201416, 7.12252594083798],
        [80.0362157821655, 7.13391706687842],
        [80.0469875335693, 7.14113484866904],
        [80.0580811500549, 7.15233389516605],
        [80.0660848617554, 7.16762036309639],
        [80.0741958618164, 7.18539715632088],
        [80.0894093513489, 7.19806402793154],
        [80.1048159599304, 7.21288062553399],
        [80.1178407669067, 7.23035762658355],
        [80.1262521743774, 7.24251236507477], //user 1
        [80.1352429389954, 7.25645478762832],
        [80.1532030105591, 7.25668893149662], //user2
        [80.1690602302551, 7.25609292868312],
        [80.1948738098145, 7.27082248102281],
        [80.2105808258057, 7.27337668952915],
        [80.2386045455933, 7.29329901673203],
        [80.2691173553467, 7.31394408276246],
        [80.3005743026733, 7.33079996485982],
        [80.3250789642334, 7.32850147301483],
        [80.342845916748, 7.32160592634252],
        [80.3645610809326, 7.31871146756583],
        [80.3903102874756, 7.32135053367667],
        [80.4335260391235, 7.317987849937],
        [80.4403495788574, 7.31620008370492],
        [80.4546403884888, 7.29619364013886],
        [80.469446182251, 7.2886164980683],
        [80.4788875579834, 7.26541602510502],
        [80.5207943916321, 7.25775322027142],
        [80.5527877807617, 7.26690599976569],
        [80.5633234977722, 7.26769355580468], //current location
        [80.5899846553802, 7.25714657597829],
        [80.5950808525085, 7.23333780291565],
        [80.5986642837524, 7.2138172907057],
        [80.5983209609985, 7.19653124881904],
        [80.5930423736572, 7.18890985359983],
        [80.5795669555664, 7.17464600508417],
        [80.5733871459961, 7.16842938193754],
        [80.5666065216064, 7.16214880322981],
        [80.5616176128387, 7.14519080880432],
        [80.559139251709, 7.13319315327907],
        [80.5583131313324, 7.1246338528027],
        [80.559686422348, 7.10835583680911],
        [80.5526375770569, 7.08363429400612],
        [80.5408304929733, 7.07416373918669],
        [80.5347794294357, 7.05741012358288],
        [80.5311101675034, 7.03282960364078],
        [80.5456048250198, 7.01822016160599],
        [80.5394303798676, 6.99425521172653],
        [80.5298817157745, 6.98658254711447],
        [80.5262124538422, 6.9620195901155],
        [80.5375421047211, 6.94996394172511],
        [80.5588281154633, 6.93477679266221],
        [80.5974821117859, 6.89337708045897],
        [80.6088674068451, 6.92819483257813],
        [80.6610631942749, 6.94004868465559],
        [80.6528770923615, 6.96897381181766],
        [80.6890225410461, 6.95715263857448],
        [80.7167458534241, 6.94477736178814],
        [80.7434391975403, 6.94151841371859],
        [80.7524621486664, 6.91951459912167],
        [80.8147805929184, 6.87697915192584],
        [80.8307611942291, 6.85466875233915],
        [80.8430993556976, 6.81800265389579],
        [80.8968508243561, 6.77940541224151],
        [80.9575492143631, 6.76829334987769],
        [80.9591746330261, 6.80190575444165],
        [80.9877347946167, 6.82879931170357],
        [81.0058611631393, 6.8298539302447],
        [81.0130158291252, 6.83981148513348],
        [81.0256719589233, 6.84431475284823],
        [81.0431492328644, 6.86124108183838],
        [81.0470867156983, 6.87577018836384],
        [81.0626810789108, 6.90291520539217],
        [81.0421299934387, 6.93151777537185],
        [81.0341048240662, 6.95031539168373],
        [81.0597735643387, 6.97981495007998]
    ];

    const distance = calc_total_distance(start, end, path);
    const avgSpeed = calcAverageSpeed(previousLocationsAll, time, 30);
    if (avgSpeed === null) {
        return res.status(500).json({
            message: "not enough data",
            previousLocations: previousLocationsAll
        });
    }
    const ETA = distance / avgSpeed;

    res.status(200).json({
        start: start,
        end: end,
        distance: distance,
        avgSpeed: avgSpeed,
        ETA: ETA
    });
});

exports.encodedPolyline = functions.https.onRequest((req, res) => {
    const poly = polyline.encode([
        [80.5899846553802, 7.25714657597829],
        [80.5964970588684, 7.26003078979002],
        [80.6318271160126, 7.2891592470582],
        [80.6351744894943, 7.29778722631248],
        [80.6350243091583, 7.30224355542758],
        [80.6308079132832, 7.31901719818626],
        [80.6326425075531, 7.32974649090314],
        [80.6413327624657, 7.33791357808568],
        [80.6512677669525, 7.3395256129118],
        [80.6825852394104, 7.35053883893929],
        [80.6622219085693, 7.38055514271498],
        [80.6421428918839, 7.4113620310728],
        [80.6341016292572, 7.42030419046644],
        [80.6321224058959, 7.44141613194807],
        [80.6249928474426, 7.4678472486428]
    ]);

    res.status(200).json({
        encodedPolyline: poly
    });
});

exports.pushRailLines = functions.https.onRequest(async (req, res) => {
    const kelani_valley_line= [[79.8662281036377,6.92957939492207],
    [79.8784804344177,6.92634164277076],
    [79.884467124939,6.91324130036919],
    [79.8779010772705,6.8969878505154],
    [79.8829221725464,6.88301327206406],
    [79.8910117149353,6.87206339104552],
    [79.9022340774536,6.86490535582417],
    [79.9088644981384,6.86217845693802],
    [79.9178981781006,6.85280462293261],
    [79.9267816543579,6.84820285513978],
    [79.9489259719849,6.84715892941632],
    [79.9682593345642,6.84375017645728],
    [79.9750828742981,6.84405909569731],
    [79.9924635887146,6.84569956003609],
    [80.0043940544128,6.84592325928179],
    [80.0189852714539,6.84691392610947],
    [80.0327503681183,6.84804307073831],
    [80.0462794303894,6.84338799502474],
    [80.0600016117096,6.84290863682391],
    [80.0726294517517,6.84430410046968],
    [80.0794208049774,6.83904179640722],
    [80.0912439823151,6.84307907535045],
    [80.1051485538483,6.845071071118],
    [80.1093864440918,6.85301766666229],
    [80.1140427589417,6.86255127606695],
    [80.1172614097595,6.86914480040548],
    [80.1246750354767,6.87922131849322],
    [80.1238703727722,6.88311978717644],
    [80.1270890235901,6.90099268422373],
    [80.1349210739136,6.91788504056376],
    [80.1373028755188,6.94063444678874],
    [80.1716995239258,6.93677905354217],
    [80.187771320343,6.93383956124086],
    [80.207405090332,6.95472446883113]
    ];

    //var segmentIndexes = [0];
    //const segementEnds = [[80.8655977249146,8.13774627250562],[81.6987991333008,7.72447258872993]];

    /*for (var k = 0; k < segementEnds.length; k++) {
        for (var l = 0; l < batline.length; l++) {
            if (segementEnds[k][0] === batline[l][0] && segementEnds[k][1] === batline[l][1]) {
                segmentIndexes.push(l);
        
            }
        }
    }*/


    var segments = [];

    /*for (var i = 0; i < segmentIndexes.length-1; i++) {
        var segment = [];
        for (var j = segmentIndexes[i]; j <= segmentIndexes[i+1]; j++) {
            segment.push(new admin.firestore.GeoPoint(batline[j][1], batline[j][0]));
        }
        segments.push(segment);
    }*/
    for (var i = 0; i < kelani_valley_line.length; i++) {
        segments.push(new admin.firestore.GeoPoint(kelani_valley_line[i][1], kelani_valley_line[i][0]));
    }

    await db.doc('rail_lines/kelani_valley_line/segments/segment_1').set({ coordinates: segments });
    //await db.doc('rail_lines/batticaloa_line/segments/segment_2').set({ coordinates: segments[1] });
    //await db.doc('rail_lines/main_line/segments/segment_3').set({ coordinates: segments[2] });
    //await db.doc('rail_lines/main_line/segments/segment_4').set({ coordinates: segments[3] });
    //await db.doc('rail_lines/main_line/segments/segment_5').set({ coordinates: segments[4] });


    res.status(200).json({
        message: "computation completed",
        seg_1:segments.length,
        seg: segments
    });
});


var calc_total_distance = function(start, end, path) {
    var endIndex = 0;

    for (var k = 0; k <= path.length; k++) {
        if (path[k][0] === end.longitude && path[k][1] === end.latitude) {
            endIndex = k;
            break;
        }
    }

    var minValue = Infinity;
    var startIndex = 0;

    for (var i = 0; i <= endIndex; i++) {

        var pointa = {
            latitude: path[i][1],
            longitude: path[i][0]
        }

        var dist = geolib.getDistanceSimple(start, pointa);

        if (dist < minValue) {
            startIndex = i;
            minValue = dist;
        }
    }

    var distance = 0;

    for (var j = startIndex; j <= endIndex - 1; j++) {
        var pointb = {
            latitude: path[j][1],
            longitude: path[j][0]
        }
        var pointc = {
            latitude: path[j + 1][1],
            longitude: path[j + 1][0]
        }
        distance += geolib.getDistance(pointb, pointc);
    }

    return distance;
}

var appendLeadingZeros = function(value) {
    if (value.length < 2) {
        return "0" + value;
    } else {
        return value;
    }
}

var calcAverageSpeed = function(previousLocationsAll, time, limit) {
    const timeLimit = time - limit;
    const previousLocationsSelected = [];

    for (var i = 0; i < previousLocationsAll.length; i++) {
        var time_stamp = previousLocationsAll[i].time_stamp._seconds;
        if (time_stamp > timeLimit) {
            previousLocationsSelected.push(previousLocationsAll[i]);
        }
    }

    console.log(previousLocationsSelected);
    if (previousLocationsSelected.length < 2) { return null; }

    var speedArray = [];
    for (var j = 0; j < previousLocationsSelected.length - 1; j++) {
        var pointA = {
            latitude: previousLocationsSelected[j].location._latitude,
            longitude: previousLocationsSelected[j].location._longitude
        }
        var pointB = {
            latitude: previousLocationsSelected[j + 1].location._latitude,
            longitude: previousLocationsSelected[j + 1].location._longitude
        }
        var deltaTime = previousLocationsSelected[j + 1].time_stamp._seconds - previousLocationsSelected[j].time_stamp._seconds;
        return (geolib.getDistance(pointA, pointB) / deltaTime);
    }
    var speedSum = 0;
    for (var k = 0; k < speedArray.length; k++) {
        speedSum += speedArray[k];
    }
    return speedSum / speedArray.length;
}

//get current location

exports.getCurrentLocation = functions.https.onRequest(async(req,res) =>{

    //const trainRunId = req.body.trainRunId;
    const trainId = "1";
    const userId = "1";
    const path = [
        [79.8505210876465, 6.93349874935266],
        [79.8662281036377, 6.92957939492207],
        [79.8791670799255, 6.93750327346625], //in previous
        [79.894552230835, 6.96112501199875],
        [79.8991870880127, 6.97533156282076],
        [79.9003028869629, 6.98751434863466],
        [79.9068260192871, 7.00020796253534],
        [79.9182415008545, 7.01656432490157],
        [79.9214601516724, 7.02925714765386],
        [79.931116104126, 7.04731613665995],
        [79.9371242523193, 7.05506765677165],
        [79.9457502365112, 7.06618362115098],
        [79.9605774879456, 7.06850473707687],
        [79.9737739562988, 7.07468012633111],
        [79.9936866760254, 7.09416400233892],
        [80.0104665756226, 7.10711020945972],
        [80.0203800201416, 7.12252594083798],
        [80.0362157821655, 7.13391706687842],
        [80.0469875335693, 7.14113484866904],
        [80.0580811500549, 7.15233389516605],
        [80.0660848617554, 7.16762036309639],
        [80.0741958618164, 7.18539715632088],
        [80.0894093513489, 7.19806402793154],
        [80.1048159599304, 7.21288062553399],
        [80.1178407669067, 7.23035762658355],
        [80.1262521743774, 7.24251236507477], //user 1
        [80.1352429389954, 7.25645478762832],
        [80.1532030105591, 7.25668893149662], //user2
        [80.1690602302551, 7.25609292868312],
        [80.1948738098145, 7.27082248102281],
        [80.2105808258057, 7.27337668952915],
        [80.2386045455933, 7.29329901673203],
        [80.2691173553467, 7.31394408276246],
        [80.3005743026733, 7.33079996485982],
        [80.3250789642334, 7.32850147301483],
        [80.342845916748, 7.32160592634252],
        [80.3645610809326, 7.31871146756583],
        [80.3903102874756, 7.32135053367667],
        [80.4335260391235, 7.317987849937],
        [80.4403495788574, 7.31620008370492],
        [80.4546403884888, 7.29619364013886],
        [80.469446182251, 7.2886164980683],
        [80.4788875579834, 7.26541602510502],
        [80.5207943916321, 7.25775322027142],
        [80.5527877807617, 7.26690599976569],
        [80.5633234977722, 7.26769355580468], //current location
        [80.5899846553802, 7.25714657597829],
        [80.5950808525085, 7.23333780291565],
        [80.5986642837524, 7.2138172907057],
        [80.5983209609985, 7.19653124881904],
        [80.5930423736572, 7.18890985359983],
        [80.5795669555664, 7.17464600508417],
        [80.5733871459961, 7.16842938193754],
        [80.5666065216064, 7.16214880322981],
        [80.5616176128387, 7.14519080880432],
        [80.559139251709, 7.13319315327907],
        [80.5583131313324, 7.1246338528027],
        [80.559686422348, 7.10835583680911],
        [80.5526375770569, 7.08363429400612],
        [80.5408304929733, 7.07416373918669],
        [80.5347794294357, 7.05741012358288],
        [80.5311101675034, 7.03282960364078],
        [80.5456048250198, 7.01822016160599],
        [80.5394303798676, 6.99425521172653],
        [80.5298817157745, 6.98658254711447],
        [80.5262124538422, 6.9620195901155],
        [80.5375421047211, 6.94996394172511],
        [80.5588281154633, 6.93477679266221],
        [80.5974821117859, 6.89337708045897],
        [80.6088674068451, 6.92819483257813],
        [80.6610631942749, 6.94004868465559],
        [80.6528770923615, 6.96897381181766],
        [80.6890225410461, 6.95715263857448],
        [80.7167458534241, 6.94477736178814],
        [80.7434391975403, 6.94151841371859],
        [80.7524621486664, 6.91951459912167],
        [80.8147805929184, 6.87697915192584],
        [80.8307611942291, 6.85466875233915],
        [80.8430993556976, 6.81800265389579],
        [80.8968508243561, 6.77940541224151],
        [80.9575492143631, 6.76829334987769],
        [80.9591746330261, 6.80190575444165],
        [80.9877347946167, 6.82879931170357],
        [81.0058611631393, 6.8298539302447],
        [81.0130158291252, 6.83981148513348],
        [81.0256719589233, 6.84431475284823],
        [81.0431492328644, 6.86124108183838],
        [81.0470867156983, 6.87577018836384],
        [81.0626810789108, 6.90291520539217],
        [81.0421299934387, 6.93151777537185],
        [81.0341048240662, 6.95031539168373],
        [81.0597735643387, 6.97981495007998]
    ];
    //const trainRunDoc = db.doc("train_run/" + trainRunId + "/" + previous_locations + "/0").get();
    //const time = trainRunDoc.data().location;

    const trainRunDoc = await db.doc("trains/" + trainId).get();
    const user_location_list = trainRunDoc.data().location_list;

    var latitude_list = [];
    var longitude_list = [];

    if (user_location_list === null) {
        return res.status(500).json({
            message: "not enough data",
            previousLocations: previousLocationsAll
        });
    }

    trainRunDoc.forEach(element => {
        latitude_list.push(element.data().location.latitude);
        longitude_list.push(element.data().location.longitude);
    });

    var latitude_sum = 0;
    var longitude_sum = 0;

    for (var i = 0; i < latitude_list.length; i++) {
        latitude_sum += latitude_list[i];
    }
    for (var j = 0; j < longitude_list.length; j++) {
        longitude_sum += longitude_list[j];
    }

    var average_latitude = latitude_sum/latitude_list.length;
    var average_longitude = longitude_sum/longitude_list.length;

    const div_latitude = standardDeviation(latitude_list);
    const div_longitude = standardDeviation(longitude_list);

    var c = 0;

    while(c<longitude_list.length){
        if(longitude_list[c] > (div_longitude + average_longitude) | longitude_list[c] < (average_longitude-div_longitude)){
            longitude_list.splice(c, 1);
            latitude_list.splice(c, 1);
        }
        else{
            if(latitude_list[c] > (div_latitude + average_latitude) | latitude_list[c] < (average_latitude-div_latitude)){
                latitude_list.splice(c, 1);
                longitude_list.splice(c, 1);
            }
            else{
                c = c + 1;
            }
        }
    }
    
    latitude_sum = 0;
    longitude_sum = 0;

    for (i = 0; i < latitude_list.length; i++) {
        latitude_sum += latitude_list[i];
    }
    for (j = 0; j < longitude_list.length; j++) {
        longitude_sum += longitude_list[j];
    }

    average_latitude = latitude_sum/latitude_list.length;
    average_longitude = longitude_sum/longitude_list.length;

    var minDistance = Infinity;
    var correctIndex = 0;

    var average_location = {
        latitude: average_latitude,
        longitude: average_longitude
    };

    for (var k = 0; k < path.length; k++) {

        var pointa = {
            longitude: path[k][0],
            latitude: path[k][1]    
        };

        var dist = geolib.getDistance(average_location, pointa);

        if (dist < minDistance) {
            correctIndex = k;
            minDistance = dist;
        }
    }

    var train_current_location = new admin.firestore.GeoPoint(path[correctIndex][1], path[correctIndex][0]);
    var timestamp = admin.firestore.Timestamp.fromDate(new Date());
    
    var c_location={
        location: train_current_location,
        time: timestamp 
    };

    db.doc('trains/'+trainId).set({ current_location: c_location });

    res.status(200).json({
        message: "reached getCurrentLocation",
        lat: path[correctIndex][1],
        lon: path[correctIndex][0],
        avg_lat: average_latitude,
        avg_lon: average_longitude,
        minDistance: minDistance,
        div_lat: div_latitude,
        div_lon: div_longitude,
        kValue: k
    });

});

//get standard deviation
function standardDeviation(values){
    var avg = average(values);
    
    var squareDiffs = values.map(function(value){
      var diff = value - avg;
      var sqrDiff = diff * diff;
      return sqrDiff;
    });
    
    var avgSquareDiff = average(squareDiffs);
  
    var stdDev = Math.sqrt(avgSquareDiff);
    return stdDev;
  }
  
  function average(data){
    var sum = data.reduce(function(sum, value){
      return sum + value;
    }, 0);
  
    var avg = sum / data.length;
    return avg;
  }
