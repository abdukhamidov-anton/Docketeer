/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { convertToMetricsArr } from "../helper/parseContainerFormat";
import { Pie, Line } from "react-chartjs-2";
import * as actions from "../../actions/actions";
import query from "../helper/psqlQuery";
import * as helper from "../helper/commands";
import * as queryType from "../../constants/queryTypes";
import { Link, Redirect, BrowserRouter } from "react-router-dom";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";

/** TODO 
 * 1. Remove prop drilling from parent components
 * 2. Move get files from DB to its own helpers
 * 
 */

/**
 *
 * @param {*} props
 * Display general metrics
 */
const Metrics = (props) => {
  const [activeContainers, setActiveContainers] = useState({});
  const [gitUrls, setGitUrls] = useState([]);
  const [timePeriod, setTimePeriod] = useState("4");
  const memory = useSelector((state) => state.graphs.graphMemory);
  const cpu = useSelector((state) => state.graphs.graphCpu);
  const axis = useSelector((state) => state.graphs.graphAxis);
  const runningList = useSelector((state) => state.containersList.runningList);
  const stoppedList = useSelector((state) => state.containersList.stoppedList);

  const dispatch = useDispatch();

  const buildAxis = (data) => dispatch(actions.buildAxis(data));
  const buildMemory = (data) => dispatch(actions.buildMemory(data));
  const buildCpu = (data) => dispatch(actions.buildCpu(data));

  const selectedStyling = {
    background: "#e1e4e6",
    color: "#042331",
    borderTopRightRadius: "10px",
    borderBottomRightRadius: "10px",
  };

  const getContainerMetrics = () => {
    let queryString = `SELECT * FROM metrics WHERE container_name = $1 `;
    let queryStringEnd = `AND created_at >= now() - interval '${timePeriod} hour' ORDER BY "created_at" ASC`;

    let containerNamesArr = Object.keys(activeContainers);
    
    if (containerNamesArr.length === 1) {
      queryString += queryStringEnd;
      return query(queryString, containerNamesArr);
    }

    containerNamesArr
      .slice(1)
      .forEach((containerName, idx) => {
        const additionalParameter = `OR container_name = $${idx + 2} `;
        queryString += additionalParameter;
      });
      
    
    queryString += queryStringEnd;
    
    return query(queryString, containerNamesArr);
  };

  // Auxilary Object which will be passed into Line component
  const memoryObj = {
    labels: axis,
    datasets: memory,
  };
  const cpuObj = {
    labels: axis,
    datasets: cpu,
  };

  /**
   * Resets all graph data in global store
   * Builds memory and cpu object for input into Line Components
   * @return
   */
  const formatData = async () => {
    buildMemory("clear");
    buildCpu("clear");
    buildAxis("clear");
    //if active containers is empty render the empty graphs
    if (!Object.keys(activeContainers).length) {
      return;
    }
    // DB QUERY LIKELY GOING HERE
    let output = await getContainerMetrics();

    const generateLineColor = () => {
      const colorOptions = [
        "red",
        "blue",
        "green",
        "purple",
        "yellow",
        "grey",
        "orange",
      ];

      return colorOptions[Math.floor(Math.random() * 7)];
    };

    // build function that will return formated object into necessary
    // datastructure for chart.js line graphs
    const buildLineGraphObj = (containerName) => {
      const obj = {
        label: containerName,
        data: [],
        fill: false,
        borderColor: generateLineColor(),
      };

      return obj;
    };

    buildMemory('clear');
    buildCpu('clear');
    buildAxis('clear');

    if (!Object.keys(activeContainers).length) {
      return;
    }

    const containerMetrics = await getContainerMetrics();

    const auxObj = {};

    Object.keys(activeContainers).forEach((container) => {
      auxObj[container] = {
        memory: buildLineGraphObj(container),
        cpu: buildLineGraphObj(container),
      };
    });

    // iterate through each row from query and buld Memory and CPU objects [{}, {}]
    containerMetrics.rows.forEach((dataPoint) => {
      const currentContainer = dataPoint.container_name;
      auxObj[currentContainer].cpu.data.push(
        dataPoint.cpu_pct.replace("%", "")
      );
      auxObj[currentContainer].memory.data.push(
        dataPoint.memory_pct.replace("%", "")
      );
      buildAxis(dataPoint.created_at);
    });

    let longest = 0;

    Object.keys(auxObj).forEach((containerName) => {
      if (auxObj[containerName].memory.data.length > longest) {
        longest = auxObj[containerName].memory.data.length;
      }
    });

    // REFACTOR THIS BRUTE FORCE APROACH TO ADDING 0 DATAPOINTS TO ARRAY
    Object.keys(auxObj).forEach((containerName) => {

      if (auxObj[containerName].memory.data.length < longest) {
        console.log('in loop:', containerName, longest - auxObj[containerName].memory.data.length)
        let lengthToAdd = longest - auxObj[containerName].memory.data.length
        for (let i = 0; i < lengthToAdd; i += 1) {
          console.log(i, lengthToAdd)
          auxObj[containerName].memory.data.unshift("0.00");
          auxObj[containerName].cpu.data.unshift("0.00");
        }
      }
      console.log('this is longest: ', longest);
      console.log('this is auxObj: ', auxObj);
      buildMemory([auxObj[containerName].memory]);
      buildCpu([auxObj[containerName].cpu]);
    });
  };

  const fetchGitData = async (containerName) => {
    const ob = {};
    ob[containerName] = [];
    let time = Number(timePeriod);
    let date = new Date();
    date.setHours(date.getHours() - time);
    date = date.toISOString();
    console.log("********DATE ISOOOO***********", date);
    const url = await helper.getContainerGitUrl(containerName);
    // formate needed = 2020-10-26T18:44:25Z
    //https://api.github.com/repos/oslabs-beta/Docketeer/commits?since=%272020-10-27T17%3A14%3A17.446Z%27
    //https://api.github.com/repos/oslabs-beta/Docketeer/commits?since=2020-10-26T18%3A44%3A25Z

    //https://api.github.com/repos/oslabs-beta/Docketeer/commits?since=2020-10-26T21%3A40%3A22.314Z
    //https://api.github.com/repos/oslabs-beta/Docketeer/commits?since=2020-10-26T17%3A39%3A54.191Z
    if (url.rows.length) {
      const url =
        "https://api.github.com/repos/oslabs-beta/Docketeer/commits?" +
        new URLSearchParams({
          since: `${date}`,
        });
      console.log("URL**********", url);
      let data = await fetch(url);
      const jsonData = await data.json();

      jsonData.forEach((commitData) => {
        ob[containerName].push({
          time: commitData.commit.author.date,
          url: commitData.html_url,
          author: commitData.commit.author.name,
        });
      });
    } else {
      ob[containerName].push({
        time: "",
        url: "Connect github repo in settings",
      });
    }
    return ob;
  };

  const renderGitInfo = () => {
    Promise.all(
      Object.keys(activeContainers).map((container) => {
        return fetchGitData(container);
      })
    ).then((data) => setGitUrls(data));
  };

  // [{container: [{time: x, url: x}]},{}]
  let gitData;
  gitData = gitUrls.map((el, index) => {
    let name = Object.keys(el);
    const li = [
      <tr key={index}>
        <th>Date</th>
        <th>Time</th>
        <th>URL</th>
        <th>Author</th>
      </tr>,
    ];
    el[name].forEach((ob) => {
      let author = "";
      let date = "n/a";
      let time = "n/a";
      let url = (
        <Link Redirect to="/" style={selectedStyling}>
          Connect via settings page
        </Link>
      );
      let text = "";
      if (ob.time.length) {
        time = ob.time;
        author = ob.author;
        text = "Github Commits";
        url = (
          <a href={url} target="_blank">
            {text}
          </a>
        );
        time = time.split("T");
        date = time[0];
        time = time[1];
        time = time.split("").slice(0, time.length - 1);
      }
      li.push(
        <tr>
          <td>{date}</td>
          <td>{time}</td>
          <td>{url}</td>
          <td>{author}</td>
        </tr>
      );
    });
    return (
      <div>
        <h2>{name}</h2>
        <table className={"ltTable"}>{li}</table>
      </div>
    );
  });

  // Internal Note: maybe want to fix currentList and make a state variable??
  let currentList;
  const selectList = () => {
    const result = [];
    runningList.forEach((container, index) => {
      result.push(
        <FormControlLabel
        control={
          <Checkbox
            name={container.Name}
            value={container.Name}
            color='primary'
            inputProps={{ 'aria-label': container.Name  }}
          />
        } 
        label={container.Name}
      />  
      );
    });

    stoppedList.forEach((container) => {
      result.push(
        <FormControlLabel
        control={
          <Checkbox      
            name={container.Names} /* docker stopped containers use .Names property instead of .Name */
            value={container.Names}
            inputProps={{ 'aria-label': container.Names  }}  
          />
        } 
        label={container.Names}
      />  
      );
    });

    result.push(<div></div>);
    currentList = result;
  };

  const handleChange = (e) => {
    if (e.target.type === "radio") {
      setTimePeriod(e.target.value);
      return;
    }
    const containerName = e.target.name;
    // deep copy the state object - shallow copy didn't work
    const copyObj = JSON.parse(JSON.stringify(activeContainers));
    if (activeContainers[containerName]) {
      delete copyObj[containerName];
    } else {
      copyObj[containerName] = true;
    }
    setActiveContainers(copyObj);
  };

  let cpuOptions = {
    tooltips: {
      enabled: true,
      mode: "index",
    },
    title: {
      display: true,
      text: "CPU",
      fontSize: 23,
    },
    legend: { display: true, position: "bottom" },
    responsive: true,
    maintainAspectRatio: false,
  };

  let memoryOptions = {
    tooltips: {
      enabled: true,
      mode: "index",
    },
    title: {
      display: true,
      text: "MEMORY",
      fontSize: 23,
    },
    legend: { display: true, position: "bottom" },
    responsive: true,
    maintainAspectRatio: false,
  };

	/* Consider if we can combine these two. Wasn't rendering active containers when tested*/
  selectList();
  useEffect(() => {
    formatData();
    renderGitInfo();
  }, [activeContainers, timePeriod]);

  return (
    <div>
      <div className="metric-section-title">
        <h3>Over Time</h3>
      </div>
      <div className="metrics-options-form">
        <form
          onChange={(e) => {
            handleChange(e);
          }}
        >
          <input
            type="radio"
            id="4-hours"
            name="timePeriod"
            value="4"
            defaultChecked
          ></input>
          <label htmlFor='4-hours'> 4 hours</label>
          <input
            type="radio"
            id="12-hours"
            name="timePeriod"
            value="12"
          ></input>
          <label htmlFor='12-hours'> 12 hours</label>
          <input
            type='radio'
            id='other'
            name='timePeriod'
            value='24'
          ></input>
          <label htmlFor='24-hours'> 24 hours</label>
          <br></br>
          {currentList}
        </form>
        <div></div>
      </div>

      <div className="allCharts">
        <Line data={memoryObj} options={memoryOptions} />
      </div>

      <div className="allCharts">
        <Line data={cpuObj} options={cpuOptions} />
      </div>
      <div className="metric-section-title">
        <h3>GitHub History</h3>
      </div>
      <div className="gitHub-container">{gitData}</div>
    </div>
  );
};

export default Metrics;

// const cpu = {
// 	labels: dataLabels,
// 	datasets: [
// 		{
// 			label: activeContainers,
// 			 data: cpuData,
// 			 fill: false
// 		},
// 	],
// };
