# Allan下南洋 · 2014–2017

一份互動式的人生紀念頁：重新整理「[Allan下南洋](https://allanlo-go.blogspot.com/)」部落格在 2014.01 – 2017.02 間的 357 篇日誌，
記錄在馬來西亞霹靂州巴里文打（Parit Buntar）駐外管理工廠的 878 個日子。

## 頁面內容

| 段落 | 互動 |
|---|---|
| 南洋黃昏開場 | 會動的馬六甲海峽夕陽、椰影與白鷺 |
| 登機證（序章） | 撕下存根，出發 |
| 航線與足跡 | 台北⇄檳城航線動畫；馬來半島地圖可切換「北馬生活圈／半島全圖」，點地名看照片與當時日誌 |
| 四個章節（2014–2017） | 每篇日誌的原文節錄、拍立得照片（點擊放大）、原文連結 |
| 離家計日器、心情潮汐 | 拖動滑桿回到第 N 天；心情曲線可點擊跳回該篇日誌 |
| 南洋明信片 | 20 張照片牆 |
| 南洋奇幻之旅勳章 | 可拖動翻面的 3D 勳章、頒授辭、扶桑花典禮動畫 |

## 檔案

- `index.html`：直接用瀏覽器開啟即可（需與 `assets/` 同一層）
- `src/page.html`：頁面原始碼（文字、日誌節錄、版面都在這裡修改）
- `src/maps.json`：地圖輪廓（Natural Earth，公有領域）
- `src/urls.json`：引用文章的部落格連結
- `src/blog-archive.json`：部落格 357 篇文章全文備份（標題、日期、分類、內文）
- `assets/photos/`：從部落格下載的精選照片（已壓縮）
- `build.py`：修改 `src/page.html` 後執行 `python3 build.py` 重新產生 `index.html`

## 備註

部落格上 3,351 張照片中約 700 張已失效（Google 主機回應 404），主要集中在 2015 年底到 2016 年中，
例如 2015 生日跌進水溝、請員工喝水、25 週年廠慶、望海的背影等篇。若本機 `D:\Allan_Life\Allan下南洋(2014-2017)` 有原始照片，
放進 `assets/photos/` 並在 `src/page.html` 對應日誌加上 `img` 欄位即可補上。

## 動漫短片

`video/allan-nanyang-anime.mp4`：5 分鐘的動漫短片，用 Q 版角色演出四個章節的心情歷程，字幕節錄自部落格原文。
人物設定、分鏡腳本和配樂設計寫在 `video/SCRIPT.md`；動畫原始碼是 `video/anim.js`，配樂合成程式是 `video/music.py`。

## 電影感動漫版

`video/cinematic/allan-nanyang-cinematic.mp4`：5 分鐘，風格是逆光剪影、夕陽水面倒影、光暈與電影黑邊。分鏡寫在 `video/cinematic/SCRIPT.md`。

## 陽光版（90 年代動畫風格）

`video/sunny/allan-nanyang-sunny.mp4`：5 分鐘，只收錄溫暖、正面的回憶。角色採賽璐璐動畫風格（大眼睛、兩階陰影、藍天積雲）。腳本寫在 `video/sunny/SCRIPT.md`。

## 主角版（以 Allan 角色設定圖演出）

`video/allan/allan-nanyang-starring-allan.mp4`：5 分鐘。主角直接使用 Allan 提供的角色設定圖，去背後做成剪紙偶動畫，九種表情配合劇情切換。腳本寫在 `video/allan/SCRIPT.md`。
