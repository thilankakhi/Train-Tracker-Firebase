const functions = require('firebase-functions');
const polyline = require('google-polyline');
const admin = require('firebase-admin');
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
        [80.1262521743774, 7.24251236507477],
        [80.1352429389954, 7.25645478762832],
        [80.1532030105591, 7.25668893149662],
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

exports.pushRailLines = functions.https.onRequest((req, res) => {
    const mainLine = [];

    var segmentIndexes = [];
    const segementEnds = [
        [7.02925714765386, 79.9214601516724],
        [7.33079996485982, 80.3005743026733],
        [7.25714657597829, 80.5899846553802],
        [6.97981495007998, 81.0597735643387]
    ];

    for (var k = 0; k < segementEnds.length; k++) {
        for (var l = 0; l < mainLine.length; l++) {
            if (segementEnds[k][0] === mainLine[l][1] && segementEnds[k][1] === mainLine[l][0]) {
                segmentIndexes.push(l);
            }
        }
    }

    console.log(segmentIndexes);


    var segments = [];

    for (var i = 0; i < segementEnds.length; i++) {
        var segment = []
        for (var j = i; j <= segmentIndexes[i]; j++) {
            segment.push(new admin.firestore.GeoPoint(mainLine[j][1], mainLine[j][0]));
        }
        segments.push(segment);
    }

    db.doc('rail_lines/main_line/segments/segment_1').set({ coordinates: segments[0] });
    db.doc('rail_lines/main_line/segments/segment_2').set({ coordinates: segments[1] });
    db.doc('rail_lines/main_line/segments/segment_3').set({ coordinates: segments[2] });
    db.doc('rail_lines/main_line/segments/segment_4').set({ coordinates: segments[3] });

    res.status(200).json({
        message: "computation completed"
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