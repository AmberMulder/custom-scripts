//VERSION=3

const nDays = 20;           // The number of days to load data for
const scaleFactor = 1000;   // The scale factor for the SWC values
const vmin = 0.0;           // The minimum value of the colormap
const vmax = 0.4;           // The maximum value of the colormap

function setup() {
    return {
      input: ["SWC", "dataMask"],
      output: { id: "default", bands: 4 },
      mosaicking: "ORBIT"
    };
  }
  
  function preProcessScenes(collections) {
    collections.scenes.orbits = collections.scenes.orbits.filter(function (orbit) {
      var orbitDateFrom = new Date(orbit.dateFrom)
      // Select all images within the last nDays
      return orbitDateFrom.getTime() >= (collections.to.getTime() - (nDays * 24 * 3600 * 1000));
    })
    return collections
  }
  
  function get_mean_swc_value(swc, dataMask) {
    // Get the sum of all SWC values
    let n_valid_dates = 0;
    let sum = 0;
    for (let i = 0; i < swc.length; i++) {
        if (dataMask[i]) {;
            sum += swc[i];
            n_valid_dates += 1;
        }
    }
    
    // Calculate the mean SWC value
    let mean_swc_value = NaN
    if (n_valid_dates > 0) {
      mean_swc_value = sum / n_valid_dates;
    }
  
    return mean_swc_value;
  }


  const cmap = [
    [0.0, 0xfff7ea],
    [0.05, 0xfaedda],
    [0.1, 0xede4cb],
    [0.15, 0xdedcbd],
    [0.2, 0xced3af],
    [0.25, 0xbdcba3],
    [0.3, 0xaac398],
    [0.35, 0x96bc90],
    [0.4, 0x80b48a],
    [0.45, 0x68ac86],
    [0.5, 0x4da484],
    [0.55, 0x269c83],
    [0.6, 0x009383],
    [0.65, 0x008a85],
    [0.7, 0x008186],
    [0.75, 0x007788],
    [0.8, 0x006d8a],
    [0.85, 0x00618c],
    [0.9, 0x00558d],
    [0.95, 0x00478f],
    [1.0, 0x003492],
];
  
  // Prepare colormap based on provided min and max values
  const visualizer = new ColorRampVisualizer(cmap, vmin, vmax);
  
  
function evaluatePixel(samples) {
    // When there are no dates, return no data
    if (samples.length == 0) return [NaN, NaN, NaN, 0];

    // When there is no data for the last day, don't run calculation, return no data
    if (!samples[0].dataMask) return [NaN, NaN, NaN, 0];

    // Extract SWC values and dataMask
    var swc  = samples.map(sample => sample.SWC / scaleFactor);
    var dataMask = samples.map(sample => sample.dataMask);

    // Calculate mean SWC value
    mean_swc_val = get_mean_swc_value(swc, dataMask);
    
    // Apply colormap
    imgVals = visualizer.process(mean_swc_val);
   
    return [...imgVals, samples[0].dataMask];
  }
  
  