# 天際大廈 Sky Tower

仿 SimTower / Yoot Tower 嘅網頁起樓經營遊戲。純前端靜態網站，vanilla JS（ES modules）+ Canvas 2D，唔使 build step。

網址：https://fiveathree.github.io/simtower/（開咗 GitHub Pages 之後先有）

## 點樣玩

喺空地起一座摩天大廈：放租辦公室、賣住宅、開酒店，安排好電梯等住客唔使等太耐，將大廈由 1★ 經營到 **TOWER**。

- 所有人都由 **1F 大堂**出入，上層要有**電梯**或者**樓梯**先上得到。
- 每一層下面要有樓面承托；用「樓面」可以拖曳鋪空地板。
- 高樓用**快速電梯**：喺 16F、31F、46F 起**空中大堂**（3★），快速電梯只停大堂層同空中大堂，再轉普通電梯。
- **貨梯**（2★）專俾酒店清潔同餐廳送貨用，住客同訪客唔會搭。
- 用「查看」點電梯可以加轎廂（最多 8 個，每個 $20,000），逐個設待命樓層同繁忙策略（早上優先向上、傍晚優先向下）。
- 辦公室同商店每季交租、住宅入住即賣出、快餐店靠午餐同訪客、酒店每晚收房租。
- 小人顏色：黑＝正常、粉紅＝等得有啲耐、紅＝好嬲。等太耐嘅租戶季尾會搬走，按「評價」睇邊度有問題。
- 升級：2★ 人口 200；3★ 人口 600＋保安室；4★ 人口 1,500＋10 間酒店房；TOWER 人口 3,000＋30F 以上天台教堂。

| 操作 | 桌面 | 手機 |
|---|---|---|
| 起嘢 | 揀工具再撳；電梯由一層拖到另一層 | 同樣 |
| 移動畫面 | 拖曳、右鍵拖曳、`WASD`／方向鍵 | 拖曳 |
| 縮放 | 滾輪、`+`／`-` | 雙指 |
| 暫停 | 空白鍵 | 暫停掣 |
| 取消工具 | `Esc` | 揀「查看」 |

進度自動儲存喺瀏覽器 localStorage。

## 本機運行

因為用 ES modules，瀏覽器唔准由 `file://` 直接載入，要經 HTTP 開：

```bash
python -m http.server 8000
```

然後開 http://localhost:8000/。

## 部署到 GitHub Pages

1. 去 repo 嘅 **Settings → Pages**。
2. **Source** 揀 **Deploy from a branch**，Branch 揀 `main`，資料夾揀 `/ (root)`，撳 **Save**。
3. 等一兩分鐘，就會喺 https://fiveathree.github.io/simtower/ 見到。

Cloudflare Pages 都一樣：唔使 build command，輸出目錄係根目錄。

**轉 domain：** 改 `src/config.js` 嘅 `SITE_URL`，同時改 `index.html` 入面嘅 `canonical`、`og:url`、`og:image`、`twitter:image`。社交平台嘅爬蟲唔行 JS，只會讀 HTML 嗰幾行，所以兩邊都要改。

## 檔案結構

```
index.html      版面，載入 src/main.js
style.css       樣式
favicon.svg/png 網站圖示
og.png          1200×630 分享圖
src/
  main.js       啟動、主迴圈
  config.js     常數、設施資料表、星級條件、網站網址
  state.js      遊戲狀態、新遊戲、存檔／讀檔／migration
  build.js      放置規則、承托、拆卸、費用
  route.js      樓層圖、Dijkstra 路線、快取
  agents.js     小人行為
  elevator.js   電梯井、多轎廂派車、停站、繁忙策略
  schedule.js   每日日程、事件佇列、模擬一步
  economy.js    收入、支出、季度結算、升星
  render/       world（背景同樓面）、units（設施）、people（小人同轎廂）、overlay（預覽同浮動字）
  ui/           hud（頂欄）、tools（工具列）、panels（面板同對話框）、input（滑鼠觸控鍵盤）
```

模擬部分（`src/*.js`）唔掂 DOM，要出訊息就經 `state.js` 嘅 `hooks`。

## 電梯數值

| 種類 | 闊 | 費用 | 載客 | 速度（層／遊戲分鐘） | 每季維修（每轎廂） | 解鎖 |
|---|---|---|---|---|---|---|
| 電梯 | 4 | $30,000 + $4,000／層 | 15 | 5 | $10,000 | 1★ |
| 快速電梯 | 6 | $60,000 + $6,000／層 | 30 | 12 | $20,000 | 3★ |
| 貨梯 | 4 | $30,000 + $4,000／層 | 15 | 5 | $10,000 | 2★ |

## 存檔

存檔放 localStorage 嘅 `skytower_save`，有 `version` 欄位。加新版本時喺 `state.js` 嘅 `MIGRATIONS` 加一步。目前係 v3；原型嘅 v1 存檔（`skytower_v1`）同 v2 存檔都會自動升級，舊資料保留唔刪。

## 開發進度

- [x] Phase 1：重構（玩法不變）
- [x] Phase 2：電梯升級
- [ ] Phase 3：更多設施
- [ ] Phase 4：事件同經營
- [ ] Phase 5：地點同難度
- [ ] Phase 6：打磨

詳情睇 [PLAN.md](PLAN.md)。
