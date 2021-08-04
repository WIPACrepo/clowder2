import React, {useEffect, useState} from "react";
import config from "../app.config";
import TopBar from "./childComponents/TopBar";
import Breadcrumbs from "./childComponents/BreadCrumb";
import {
	Tabs,
	Tab,
	AppBar,
	Box,
	Typography
} from "@material-ui/core"

export default function File(props){
	const {
		listFileMetadata, fileMetadata,
		listFileExtractedMetadata, fileExtractedMetadata,
		listFileMetadataJsonld, fileMetadataJsonld,
		listFilePreviews, filePreviews,
		...other} = props;

	const [selectedTabIndex, setSelectedTabIndex] = useState(0);

	// component did mount
	useEffect(() => {
		// attach helper jquery
		const script = document.createElement("script");
		script.src = `../public/clowder/assets/javascripts/previewers/helper.js`;
		script.async = true;
		document.body.appendChild(script);
		return () => {
			document.body.removeChild(script);
		}
	}, []);

	useEffect(() => {
		// remove last previewer script attached
		const previewerScripts = document.getElementsByClassName("previewer-script");
		while (previewerScripts.length > 0) {
			previewerScripts[0].parentNode.removeChild(previewerScripts[0]);
		}

		if (filePreviews.length > 0 && filePreviews[0].previews !== undefined){
			let uniquePid = [];
			// look at which previewer to load
			filePreviews[0].previews.map((filePreview, index)=> {

				// do not attach same previewer twice
				if (uniquePid.indexOf(filePreview["p_id"]) === -1){
					uniquePid.push(filePreview["p_id"]);

					// attach previwer jquery
					const script = document.createElement("script");
					script.className = "previewer-script";
					script.src = `../public${filePreview["p_path"]}/${filePreview["p_main"]}`;;
					script.async = true;
					document.body.appendChild(script);
					return () => {
						document.body.removeChild(script);
					}
				}
			});
		}
	}, [filePreviews])

	const selectFile = (fileId) => {
		listFileMetadata(fileId);
		listFileExtractedMetadata(fileId);
		listFileMetadataJsonld(fileId);
		listFilePreviews(fileId);
	}

	const handleTabChange = (event, newTabIndex) => {
		setSelectedTabIndex(newTabIndex);
	};

	return (
		<div>
			<TopBar />
			<div className="outer-container">
				<Breadcrumbs filename={fileMetadata["filename"]}/>

				{/*tabs*/}
				<AppBar position="static">
					<Tabs value={selectedTabIndex} onChange={handleTabChange} aria-label="file tabs">
						<Tab label="Files" {...a11yProps(0)} />
						<Tab label="Sections" {...a11yProps(1)} />
						<Tab label="Metadata" {...a11yProps(2)} />
						<Tab label="Extractions" {...a11yProps(3)} />
						<Tab label="Comments" {...a11yProps(4)} />
					</Tabs>
				</AppBar>
				<TabPanel value={selectedTabIndex} index={0}>
					Previewer
				</TabPanel>
				<TabPanel value={selectedTabIndex} index={1}>
					NA
				</TabPanel>
				<TabPanel value={selectedTabIndex} index={2}>
					Metadata
				</TabPanel>
				<TabPanel value={selectedTabIndex} index={2}>
					Extractions
				</TabPanel>
				<TabPanel value={selectedTabIndex} index={2}>
					Comments
				</TabPanel>

				<select name="files" id="files" onChange={(e)=>{ selectFile(e.target.value);}} defaultValue="select">
					<option value="select" disabled>Select A File</option>
					<option value="60ee082d5e0e3ff9d746b5fc">Text File</option>
					<option value="59933ae8e4b04cf488f47aba">PDF</option>
					<option value="5d974f435e0eb9edf7b3cf00">Audio</option>
					<option value="59933ae9e4b04cf488f47b48">Video</option>
					<option value="576b0b1ce4b0e899329e8553">Image</option>
					<option value="60ee08325e0e3ff9d746bc57">Three D</option>
				</select>
				<h4>metadata</h4>
				<div>
					<h1>
						{fileMetadata["filename"]}
					</h1>
					<p>{fileMetadata["content-type"]}</p>
					<p>{fileMetadata["data-created"]}</p>
					<p>{fileMetadata["authorId"]}</p>
					<p>{fileMetadata["filedescription"]}</p>
					<p>{fileMetadata["id"]}</p>
					<p>{fileMetadata["size"]}</p>
					<p>{fileMetadata["status"]}</p>
					<p>{fileMetadata["thumbnail"]}</p>
				</div>
				<h4>metadata jsonld</h4>
				<div>
					{
						fileMetadataJsonld.map((item) => {
							return Object.keys(item["content"]).map((key) => {
									return (<p>{key} - {JSON.stringify(item["content"][key])}</p>);
								}
							);
						})
					}
				</div>
				<h4 id="preview">previewer</h4>
				{
					filePreviews.length > 0 && filePreviews[0].previews !== undefined
						?
						filePreviews[0].previews.map((filePreview, index)=> {
							const Configuration = {};
							Configuration.tab = `#previewer_${filePreviews[0]["file_id"]}_${index}`;
							Configuration.url = `${config.hostname}${filePreview["pv_route"]}?superAdmin=true`;
							Configuration.fileid = filePreview["pv_id"];
							Configuration.previewer = `/public${filePreview["p_path"]}/`;
							Configuration.fileType = filePreview["pv_contenttype"];
							Configuration.APIKEY=config.apikey;
							Configuration.authenticated = true;
							// Configuration.metadataJsonld = fileMetadataJsonld;

							let previewId = filePreview["p_id"].replace(" ","-").toLowerCase();
							return (<div className={`configuration ${previewId}`} data-configuration={JSON.stringify(Configuration)}>
								<div id={Configuration.tab.slice(1)}></div>
							</div>);
						})
						:
						<></>
				}
			</div>

		</div>
	);
}

function TabPanel(props) {
	const { children, selectedTabIndex, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={selectedTabIndex !== index}
			id={`file-tabpanel-${index}`}
			aria-labelledby={`file-tab-${index}`}
			{...other}
		>
			{selectedTabIndex === index && (
				<Box p={3}>
					<Typography>{children}</Typography>
				</Box>
			)}
		</div>
	);
}

function a11yProps(index) {
	return {
		id: `file-tab-${index}`,
		"aria-controls": `file-tabpanel-${index}`,
	};
}
