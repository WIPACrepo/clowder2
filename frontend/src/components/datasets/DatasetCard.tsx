import React, { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";
import { parseDate } from "../../utils/common";
import {
	CardActionArea,
	CardHeader,
	CardMedia,
	IconButton,
	Tooltip,
} from "@mui/material";
import { Download } from "@mui/icons-material";
import { generateThumbnailUrl } from "../../utils/visualization";
import config from "../../app.config";
// import {Favorite, Share} from "@material-ui/icons";

type DatasetCardProps = {
	id?: string;
	name?: string;
	author?: string;
	created?: string | Date;
	description?: string;
	thumbnailId?: string;
};

export default function DatasetCard(props: DatasetCardProps) {
	const { id, name, author, created, description, thumbnailId } = props;
	const [thumbnailUrl, setThumbnailUrl] = useState("");

	useEffect(() => {
		let url = "";
		if (thumbnailId) {
			url = generateThumbnailUrl(thumbnailId);
		}
		setThumbnailUrl(url);
	}, [thumbnailId]);

	const formattedCreated = parseDate(created);

	return (
		<Card key={id} sx={{ display: "flex", flexDirection: "column" }}>
			<CardActionArea
				component={Link}
				to={`/datasets/${id}`}
				sx={{ height: "100%" }}
			>
				<CardHeader title={name} subheader={formattedCreated} />
				{thumbnailId ? (
					<CardMedia
						component="img"
						image={thumbnailUrl}
						alt={`${name}_thumbnail`}
					/>
				) : null}
				<CardContent>
					<Typography color="info.main">{author}</Typography>
					<Typography
						variant="body2"
						sx={{
							overflow: "hidden",
							textOverflow: "ellipsis",
							display: "-webkit-box",
							WebkitLineClamp: "5",
							WebkitBoxOrient: "vertical",
						}}
					>
						{description}
					</Typography>
				</CardContent>
			</CardActionArea>
			<CardActions sx={{ marginTop: "auto" }}>
				<Tooltip title="Download">
					<IconButton
						href={`${config.hostname}/api/v2/datasets/${id}/download`}
						color="primary"
						aria-label="download"
						sx={{ mr: 3 }}
					>
						<Download />
					</IconButton>
				</Tooltip>
				{/*<Tooltip title="Favorite">*/}
				{/*	<IconButton color="primary" aria-label="favorite"  sx={{mr: 3}} disabled>*/}
				{/*		<Favorite/>*/}
				{/*	</IconButton>*/}
				{/*</Tooltip>*/}
				{/*<Tooltip title="Share">*/}
				{/*	<IconButton color="primary" aria-label="share"  sx={{mr: 3}} disabled>*/}
				{/*		<Share/>*/}
				{/*	</IconButton>*/}
				{/*</Tooltip>*/}
			</CardActions>
		</Card>
	);
}
