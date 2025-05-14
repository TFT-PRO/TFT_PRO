import express from "express";
import dbConnection from "../db/mysqldb.js";
import { duplicateKeyError } from "../utils/db_error.js";
import imageQueries from "../utils/queries/imageQueries.js";
import axios from "axios";

// .env 파일에 있는 정보를 process.env에서 읽을 수 있도록 해줌.
// import dotenv from "dotenv";
// dotenv.config();
const route = express.Router();

// 아이템 이미지 조회 및 삽입
route.post("/tft_item", async (req, res) => {
  let connection;
  const base_url = `https://ddragon.leagueoflegends.com/cdn/15.8.1/img/tft-item/`;

  try {
    connection = await dbConnection();
    const { item_name } = req.body;

    const itemNames = Array.isArray(item_name) ? item_name : [item_name];

    if (itemNames.length > 0) {
      for (const name of itemNames) {
        const [result_cnt] = await connection.execute(
          imageQueries.selectItemCount,
          [name]
        );

        // db에 없는 이미지면 삽입
        if (result_cnt[0].cnt < 1) {
          // 그럼 해당 이미지 db에 삽입
          const image_url = `${base_url}${name}.png`;
          const insert_params = ["item", name, "", image_url];

          await connection.execute(imageQueries.insertImage, insert_params);
        }
      }

      // 아이템이 여러개 올 수 있기 때문에 아이템 개수 만큼 ? 생성 해주는 작업
      // prepared statement 사용하려고 ?,?,? 이런식으로 만드는 과정
      const placeholder = item_name.map(() => "?").join(", ");

      const select_query = `${imageQueries.selectImage} (${placeholder})`;

      // 이 item_list 이름으로 return 되네
      const [item_list] = await connection.execute(select_query, itemNames);

      res.status(200).json({ item_list });
    }
  } catch (err) {
    const message = err.sqlMessage;
    const result = duplicateKeyError(message);
    res.status(result.status).json({ err: result.message });
  } finally {
    if (connection) await connection.end();
  }
});

// item, champion, synergy, companion 등

// 챔피언 이미지 조회 및 삽입
route.post("/tft_champion", async (req, res) => {
  let connection;
  try {
    connection = await dbConnection();
    const { champion_name } = req.body;
    const championNames = Array.isArray(champion_name)
      ? champion_name
      : [champion_name];

    const placeholder = championNames.map(() => "?").join(", ");

    const select_query = `${imageQueries.selectImage} (${placeholder})`;

    const [result] = await connection.execute(select_query, championNames);

    res.status(200).json({ result });
    // content_id, item_id, skin_id,species 이렇게 4개의 정보를 companion 배열에 담아서 받음
  } catch (err) {
    const message = err.sqlMessage;
    const result = duplicateKeyError(message);
    res.status(result.status).json({ err: result.message });
  } finally {
    if (connection) await connection.end();
  }
});

// 시너지 이미지 조회 및 삽입
route.post("/tft_synergy", async (req, res) => {
  let connection;
  try {
    connection = await dbConnection();
    const { synergy_name } = req.body;

    const synergyName = Array.isArray(synergy_name)
      ? synergy_name
      : [synergy_name];

    const placeholder = synergyName.map(() => "?").join(", ");

    const select_query = `${imageQueries.selectImage} (${placeholder})`;

    const [result] = await connection.execute(select_query, synergyName);

    res.status(200).json({ result });
  } catch (err) {
    const message = err.sqlMessage;
    const result = duplicateKeyError(message);
    res.status(result.status).json({ err: result.message });
  } finally {
    if (connection) await connection.end();
  }
});

// 전설이 이미지 조회 및 삽입
route.post("/tft_companion", async (req, res) => {
  let connection;

  try {
    connection = await dbConnection();
    const { content_id } = req.body;

    const companionId = Array.isArray(content_id) ? content_id : [content_id];
    const companion_json_url =
      "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/companions.json";
    const response = await axios.get(companion_json_url);

    const data = response.data;

    const getImageUrl = (companion) => {
      const fileName = companion.loadoutsIcon.split("/").pop();
      let match = fileName.match(/^Tooltip_([A-Za-z]+)_/)[1].toLowerCase();

      // 강도깨비만 이상하게 잡혀있음. 그래서 따로 처리
      if (match == "tft") {
        match = "tftavatar";
      }
      const icon = fileName.replace("Tooltip_", "loot_").toLowerCase();

      return `https://raw.communitydragon.org/latest/game/assets/loot/companions/${match}/${icon}`;
    };

    const results = [];

    for (const id of companionId) {
      const companion = data.find((info) => info.contentId == id);

      if (!companion) {
        console.warn(`❌ No companion found with itemId: ${id}`);
        continue;
      }

      const imageUrl = getImageUrl(companion);

      const [rows] = await connection.execute(
        imageQueries.selectCompanionCount,
        [companion.name]
      );

      let finalUrl = imageUrl;

      if (rows[0].cnt < 1) {
        const insertParams = ["companion", companion.name, "", imageUrl];
        await connection.execute(imageQueries.insertImage, insertParams);
      } else {
        // 이미 존재하면 URL 조회
        const [urlResult] = await connection.execute(imageQueries.selectImage, [
          companion.name,
        ]);
        if (urlResult.length > 0) {
          finalUrl = urlResult[0].image_url;
        }
      }
      results.push({
        contentId: companion.contentId,
        name: companion.name,
        imageUrl: finalUrl,
      });
    }

    res.status(200).json({ companion: results });
  } catch (err) {
    const message = err.sqlMessage;
    const result = duplicateKeyError(message);
    res.status(result.status).json({ err: result.message });
  } finally {
    if (connection) await connection.end();
  }
});

export default route;
