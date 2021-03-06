/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as actions from "../../actions/actions";
import * as helper from "../helper/commands";
import ModalDisplay from "../display/ModalDisplay";
import NetworkChildrenList from "./NetworkChildrenList";
import query from "../helper/psqlQuery";
import { INSERT_NETWORK } from "../../constants/queryTypes";

/**
 *
 * @param {*} props
 * display all docker-compose network and
 * drag and drop or upload functionality
 *
 */
const Yml = (props) => {
  const [filepath, setFilepath] = useState("");
  const [fileList, setfileList] = useState("");
  const [modalValid, setModalValid] = useState(false);
  const [modalErrormessage, setModalErrormessage] = useState("");
  const [ymlFile, setYmlFile] = useState("");

  const networks = useSelector((state) => state.networkList.networkList);

  const dispatch = useDispatch();

  const composeDown = (networkName) =>
    dispatch(actions.composeDown(networkName));

  useEffect(() => {
    let holder = document.getElementById("drag-file");
    let uploadHolder = document.getElementById("uploadFile");
    holder.ondragover = () => {
      holder.style = "background-color: #EDEDED";
      return false;
    };
    holder.ondragleave = () => {
      holder.style = "background-color: white";
      return false;
    };
    holder.ondragend = () => {
      return false;
    };
    holder.ondrop = (e) => {
      e.preventDefault();
      let fileList = e.dataTransfer.files;
      if (fileList.length > 1) return;
      if (fileList[0].type === "application/x-yaml") {
        let filePath = fileList[0].path.replace(/([\s])+/g, "\\ ");
        const filteredArr = filePath.split("/");
        filteredArr.pop();
        let filteredPath = filteredArr.join("/");
        setFilepath(filteredPath);
        setfileList(fileList[0].name);
      }
      return false;
    };
    uploadHolder.onchange = (e) => {
      e.preventDefault();
      const filePath = e.target.files[0].path;
      const ymlFile = e.target.files[0];

      let uploadYmlFile = filePath; // File Path + Yaml File Name
      const filteredUploadYmlArr = uploadYmlFile.split("/");
      let uploadYmlFileName =
        filteredUploadYmlArr[filteredUploadYmlArr.length - 1];
      filteredUploadYmlArr.pop();
      let uploadYmlFilePath = filteredUploadYmlArr.join("/");

      setFilepath(uploadYmlFilePath);
      setfileList(uploadYmlFileName);

      const reader = new FileReader();
      reader.readAsText(ymlFile);
      reader.onload = function (e) {
        setYmlFile(e.target.result);
      };

      const directoryName = filteredUploadYmlArr[
        filteredUploadYmlArr.length - 1
      ].toLowerCase();
      const networkName = `${directoryName}_default`;

      return helper.addNetworkToDb(networkName, uploadYmlFilePath);
    };
  }, []);

  const handleChange = (e) => {
    const targetNetwork = e.target.id;
    let targetIndex;

    networks.forEach((network, idx) => {
      if (network[targetNetwork]) targetIndex = idx;
    });

    const filePath = networks[targetIndex].filepath;

    composeDown(targetNetwork);
    helper.dockerComposeDown(filePath, targetNetwork);
  };

  /**
   * networkList is array from the redux store
   * Only display relationship of containers when networkList's length is more than 1
   * networkList file format looks like in this format below
   * iterate through networks and find the object that includes network name as a prop,
   * and save the index of the object
   *
   *
   * [{
   *  "0": [
   *        {"cid": "1", "name": "conatiner1"},
   *        {"cid": "2", "name": "container2" }
   *      ]
   *  "filepath:" "..."
   * },
   * {
   *  "1": [
   *        {"cid": "3", "name": "container3"},
   *        {"cid": "4", "name": "container4"}
   *       ]
   *  "filepath": "..."
   * }]
   */
  const NetworkDisplay = () => {
    if (props.networkList.length) {
      let newArray = [];
      for (let i = 0; i < props.networkList.length; i++) {
        let keys = Object.keys(props.networkList[i]); // save keys in this format ["parentName"]
        let networkName = keys[0];
        newArray.push(
          <div className="yml-boxes box-shadow" key={`yml-boxes${i}`}>
            <div className="yml-labels" key={`yml-labels${i}`}>
              <p>{networkName}</p>
              <button
                className="btn-compose-down"
                id={networkName}
                onClick={handleChange}
              >
                Compose Down
              </button>
            </div>
            <div className="dependancies-container">
              <NetworkChildrenList
                networkList={props.networkList[i]}
                parent={keys[0]}
              />
            </div>
          </div>
        );
      }
      return <div>{newArray}</div>;
    } else {
      return <></>;
    }
  };

  return (
    <div className="renderContainers">
      <div className="header">
        <span className="tabTitle">Docker Compose</span>
      </div>
      <div className="settings-container">
        <div id="drag-file">
          Drag and drop or upload your Docker Compose file here to run it.
          {ymlFile && (
            <pre>
              <code>{ymlFile}</code>
            </pre>
          )}
          <p className="fileList">{fileList}</p>
          <input id="uploadFile" type="file" accept=".yml"></input>
        </div>
        <div className="btn-compose-up">
          <button
            className="btn"
            onClick={() => {
              helper.connectContainers(
                filepath,
                props.composeymlFiles,
                setModalValid,
                setModalErrormessage
              );
              setfileList("");
              setYmlFile("");
            }}
          >
            Docker Compose Up
          </button>
        </div>
      </div>
      <ModalDisplay
        modalValid={modalValid}
        setModalValid={setModalValid}
        modalErrormessage
        modalErrormessage={modalErrormessage}
      />
      <NetworkDisplay />
    </div>
  );
};

export default Yml;
