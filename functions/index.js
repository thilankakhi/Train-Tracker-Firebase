const functions = require('firebase-functions');
const polyline = require('google-polyline');
const admin = require('firebase-admin');
admin.initializeApp();
// const googleMapsClient = require('@google/maps').createClient({
//     key: 'AIzaSyAyKF-HG17K9PNqUveRKsY4d55_mfjDzh4'
// });
const geolib = require('geolib');

// var start = {
//     latitude: 51.5103,
//     longitude: 7.49347
// }
exports.calc_total_distance = functions.https.onRequest((req, res) => {
    const start = {
        latitude: req.body.start.latitude,
        longitude: req.body.start.longitude
    }
    const end = {
        latitude: req.body.end.latitude,
        longitude: req.body.end.longitude
    }

    const encodedPolyline = 'kf{jNelhk@wg@_Qy{EauD{S}t@\\yZhY{gBmJabAiu@_r@c}@cIwbEycAh~BszDn|Bo_Efq@{v@jK_cCpk@edD';
    const path = polyline.decode(encodedPolyline);

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

    res.status(200).json({
        start: start,
        end: end,
        size: path.length,
        endIndex: endIndex,
        startIndex: startIndex,
        distance: distance
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