window.INDUSTRY_CHAIN_LIBRARY = {
  "meta": {
    "title": "产业链研究库",
    "updated": "2026-06-12",
    "description": "统一沉淀产业链骨架、公众号配图、动态追踪和资料文件。"
  },
  "chains": [
    {
      "id": "pcb",
      "title": "PCB产业链",
      "shortTitle": "PCB",
      "theme": "AI服务器推动PCB向高层数、高频高速和高阶HDI升级，电子布、HVLP铜箔、PPO/PPE树脂与高端CCL形成紧缺传导。",
      "status": "已建档",
      "trackingProfile": {
        "title": "PCB专属动态追踪",
        "summary": "从AI服务器订单出发，重点看电子布、HVLP铜箔、PPO/PPE树脂的价格与供给，CCL高端等级认证，以及PCB厂扩产能否转化为订单、毛利率和现金流。",
        "metrics": [
          {
            "name": "高频高速材料供需",
            "why": "电子布、石英布、HVLP铜箔与PPO/PPE共同决定高速信号性能和CCL成本。",
            "signals": [
              "电子布提价",
              "HVLP代际",
              "PPO树脂价格",
              "石英布/PTFE认证"
            ]
          },
          {
            "name": "CCL等级与定价权",
            "why": "M7-M10认证和龙头调价决定材料升级价值能否兑现。",
            "signals": [
              "M9/M10认证",
              "FR-4调价",
              "PP半固化片",
              "产品结构与毛利率"
            ]
          },
          {
            "name": "PCB订单与技术路线",
            "why": "服务器PCB、HDI、FPC、IC载板和内埋器件对应不同增长曲线。",
            "signals": [
              "AI服务器订单",
              "高阶HDI",
              "FPC与光模块",
              "FC-BGA/内埋器件"
            ]
          },
          {
            "name": "扩产与设备订单",
            "why": "PCB厂资本开支反向拉动钻孔、曝光、检测、湿制程设备和化学品。",
            "signals": [
              "资本开支",
              "设备认证",
              "订单交付",
              "产能爬坡"
            ]
          },
          {
            "name": "盈利兑现质量",
            "why": "原料涨价与大规模扩产会造成收入、毛利率和现金流分化。",
            "signals": [
              "毛利率",
              "扣非净利",
              "经营现金流",
              "存货与应收"
            ]
          }
        ]
      },
      "article": "./content/raw/pcb-industry-chain-original.md",
      "cover": "./cover-image/pcb-industry-chain/pcb-industry-chain-cover.png",
      "diagram": "./diagram/pcb-industry-chain/pcb-industry-chain-map@2x.png",
      "diagramSvg": "./diagram/pcb-industry-chain/pcb-industry-chain-map.svg",
      "updateFile": "./content/updates/pcb-chain-updates.json",
      "chain": [
        {
          "id": "materials",
          "title": "上游：高频高速材料",
          "role": "决定信号损耗、可靠性和覆铜板材料等级",
          "items": [
            {
              "name": "电子布与石英布",
              "detail": "Low-Dk/Low-CTE、极薄布、M9石英电子布",
              "companies": "中国巨石、宏和科技、中材科技、国际复材、菲利华"
            },
            {
              "name": "高端铜箔",
              "detail": "RTF、HVLP、载体铜箔与高端电子电路铜箔",
              "companies": "铜冠铜箔、嘉元科技、德福科技"
            },
            {
              "name": "PPO/PPE与特种树脂",
              "detail": "PPO、碳氢树脂、BMI、PTFE，支撑M6-M10升级",
              "companies": "圣泉集团、东材科技、呈和科技、沃特股份、银禧科技"
            },
            {
              "name": "环氧树脂",
              "detail": "传统CCL黏合体系，成本受基础化工品影响",
              "companies": "宏昌电子"
            }
          ]
        },
        {
          "id": "support",
          "title": "制造支撑：化学品与设备",
          "role": "PCB扩产与工艺升级带动湿制程、钻孔、曝光和检测设备",
          "items": [
            {
              "name": "湿制程与电子化学品",
              "detail": "沉铜、电镀、蚀刻液及高纯湿电子化学品",
              "companies": "光华科技、新宙邦"
            },
            {
              "name": "钻孔与成型设备",
              "detail": "激光钻孔、机械钻孔、压合、成型与检测",
              "companies": "大族激光、大族数控"
            },
            {
              "name": "直写光刻",
              "detail": "高阶HDI与先进封装曝光工艺",
              "companies": "芯碁微装"
            },
            {
              "name": "IC载板激光设备",
              "detail": "高端激光打孔与差异化载板装备",
              "companies": "华工科技"
            }
          ]
        },
        {
          "id": "ccl",
          "title": "中游：覆铜板 CCL",
          "role": "把电子布、树脂和铜箔转化为PCB核心基材与定价枢纽",
          "items": [
            {
              "name": "全球与A股龙头",
              "detail": "规模、成本、认证与客户绑定构成综合壁垒",
              "companies": "建滔积层板、生益科技"
            },
            {
              "name": "高弹性扩产",
              "detail": "产能爬坡与产品结构升级带来利润弹性",
              "companies": "金安国纪、南亚新材、华正新材"
            },
            {
              "name": "材料代际",
              "detail": "FR-4向M7/M8/M9/M10及Ultra-low loss升级",
              "companies": "高端认证周期长达2-3年"
            },
            {
              "name": "价格传导",
              "detail": "树脂、电子布、铜箔涨价推动CCL连续调价",
              "companies": "建滔、生益、金安国纪等"
            }
          ]
        },
        {
          "id": "pcb-products",
          "title": "下游：PCB制造与终端",
          "role": "AI服务器、交换机、消费电子和先进封装兑现材料升级价值",
          "items": [
            {
              "name": "综合PCB龙头",
              "detail": "高层数、高频高速、高阶HDI与全球化产能",
              "companies": "鹏鼎控股、胜宏科技、沪电股份、深南电路"
            },
            {
              "name": "算力服务器PCB",
              "detail": "高层板、UBB/OAM、GPU主板与高速交换板",
              "companies": "广合科技"
            },
            {
              "name": "差异化PCB路线",
              "detail": "内埋器件、电源管理、FPC与光通信协同",
              "companies": "中富电路、东山精密"
            },
            {
              "name": "IC载板/封装基板",
              "detail": "CSP、FC-BGA与端侧AI芯片封装",
              "companies": "兴森科技、深南电路"
            },
            {
              "name": "终端应用",
              "detail": "AI服务器、1.6T光模块、交换机、汽车与消费电子",
              "companies": "AI算力基础设施是本轮核心增量"
            }
          ]
        }
      ],
      "logic": [
        {
          "title": "AI算力拉动升级",
          "body": "服务器平台迭代推动PCB向更高层数、更高速率与更高材料等级演进。"
        },
        {
          "title": "三类材料紧缺传导",
          "body": "电子布、HVLP铜箔和PPO/PPE树脂共同形成高频高速CCL的供给瓶颈。"
        },
        {
          "title": "CCL定价与认证",
          "body": "连续调价体现供需，M9/M10认证与客户导入决定长期竞争壁垒。"
        },
        {
          "title": "扩产形成正反馈",
          "body": "PCB厂资本开支反向拉动钻孔、光刻、湿制程设备和上游材料需求。"
        },
        {
          "title": "差异化路线并行",
          "body": "服务器PCB、高阶HDI、FPC、内埋器件和IC载板分别承接不同终端增量。"
        }
      ],
      "watchlist": [
        {
          "segment": "电子布与石英布",
          "signals": [
            "月度报价与提价轮次",
            "低介电/低膨胀认证",
            "石英布批量进度",
            "新增产能点火与交期"
          ],
          "companies": "中国巨石、宏和科技、中材科技、国际复材、菲利华"
        },
        {
          "segment": "高端铜箔",
          "signals": [
            "HVLP代际与认证",
            "高端产品满产率",
            "加工费与价格",
            "扩产资本开支"
          ],
          "companies": "铜冠铜箔、嘉元科技、德福科技"
        },
        {
          "segment": "PPO/PPE与特种树脂",
          "signals": [
            "全球供给恢复",
            "PPO树脂价格与供需缺口",
            "新增产能投产",
            "头部CCL客户认证"
          ],
          "companies": "圣泉集团、东材科技、呈和科技、沃特股份、银禧科技"
        },
        {
          "segment": "化学品与PCB设备",
          "signals": [
            "PCB厂资本开支",
            "AI服务器设备认证",
            "订单与交付",
            "经营现金流"
          ],
          "companies": "光华科技、新宙邦、大族激光、大族数控、芯碁微装、华工科技"
        },
        {
          "segment": "覆铜板 CCL",
          "signals": [
            "龙头调价函",
            "高端材料认证",
            "海外客户导入",
            "产品结构与毛利率"
          ],
          "companies": "建滔积层板、生益科技、金安国纪、南亚新材、华正新材"
        },
        {
          "segment": "PCB制造",
          "signals": [
            "AI服务器订单",
            "高端扩产节奏",
            "产品结构与毛利率",
            "客户与平台认证"
          ],
          "companies": "鹏鼎控股、胜宏科技、沪电股份、深南电路、广合科技、中富电路、东山精密、兴森科技"
        }
      ],
      "updates": [
        {
          "date": "2026-06-12",
          "segment": "全产业链",
          "signal": "根据新版完整原稿升级PCB研究框架",
          "impact": "上游新增PPO/PPE、PTFE、石英电子布和HVLP5铜箔，设备与化学品独立追踪，下游补充服务器PCB、内埋器件、FPC与IC载板等差异化路线。",
          "confidence": "基准框架",
          "sourceTitle": "PCB产业链深度解析：从上游材料到下游制造全梳理",
          "sourceUrl": "./content/raw/pcb-industry-chain-original.md",
          "notes": "本次为结构性升级；原稿中的新闻、价格、认证和财务数据仍需随公告和公开报道持续核验。"
        },
        {
          "date": "2026-06-12",
          "segment": "PPO/PPE树脂",
          "signal": "高频高速树脂成为电子布和铜箔之外的第三条上游紧缺主线",
          "impact": "PPO/PPE供应、价格和国产产能投放将直接影响M6-M10覆铜板成本、交期与国产替代节奏。",
          "confidence": "重点观察",
          "sourceTitle": "PCB产业链深度解析：从上游材料到下游制造全梳理",
          "sourceUrl": "./content/raw/pcb-industry-chain-original.md",
          "notes": "重点跟踪圣泉集团、东材科技、呈和科技及银禧科技的产能、客户认证和满产状态。"
        },
        {
          "date": "2026-06-04",
          "segment": "电子布",
          "signal": "待核验：机构调研观点称电子布连续涨价",
          "impact": "电子布供需紧张若持续，将继续向CCL和PCB环节传导成本与涨价压力。",
          "confidence": "待核验",
          "sourceTitle": "机构调研日记：电子布机构最新观点梳理",
          "sourceUrl": "https://v.douyin.com/wl4Ub_vsx0U/",
          "notes": "后续补充原始调研纪要、报价口径、涨价品类和公司公告验证。"
        }
      ]
    },
    {
      "id": "mlcc",
      "title": "MLCC产业链",
      "shortTitle": "MLCC",
      "theme": "AI算力与新能源车需求共振，高端MLCC结构性紧缺，材料和制造环节迎来国产替代窗口。",
      "status": "已建档",
      "trackingProfile": {
        "title": "MLCC专属动态追踪",
        "summary": "重点看AI服务器和新能源车需求是否造成高端MLCC紧缺，并向粉体、浆料、离型膜和国产制造传导。",
        "metrics": [
          {
            "name": "AI服务器MLCC用量与ASP",
            "why": "AI服务器是本轮MLCC价值量提升的核心变量，决定高端MLCC涨价弹性。",
            "signals": [
              "单机/机柜用量",
              "服务器ASP",
              "村田/三星订单",
              "产能利用率"
            ]
          },
          {
            "name": "新能源车车规导入",
            "why": "车规MLCC认证周期长、客户绑定强，是长期稳定增长的关键。",
            "signals": [
              "AEC-Q200认证",
              "Tier1导入",
              "单车用量",
              "ADAS渗透率"
            ]
          },
          {
            "name": "陶瓷粉体与电极材料",
            "why": "粉体和电极浆料决定高容、小尺寸、高压产品性能，也是国产替代上游抓手。",
            "signals": [
              "钛酸钡粉体价格",
              "纳米镍粉订单",
              "银/铜浆送样",
              "客户验证"
            ]
          },
          {
            "name": "离型膜与良率",
            "why": "高端离型膜影响薄层化和高容MLCC良率，决定上游耗材利润拐点。",
            "signals": [
              "三星/村田批供",
              "薄层高容产品",
              "基膜自制",
              "毛利率爬坡"
            ]
          },
          {
            "name": "国产制造份额",
            "why": "日韩龙头集中高端产能时，中低端外溢和高端认证会共同推动国产替代。",
            "signals": [
              "国产市占率",
              "高容MLCC放量",
              "特种/射频订单",
              "涨价传导"
            ]
          }
        ]
      },
      "article": "./content/raw/mlcc-industry-chain-original.md",
      "cover": "./cover-image/mlcc-industry-chain/mlcc-industry-chain-cover.png",
      "diagram": "./diagram/mlcc-industry-chain/mlcc-industry-chain-map@2x.png",
      "diagramSvg": "./diagram/mlcc-industry-chain/mlcc-industry-chain-map.svg",
      "updateFile": "./content/updates/mlcc-chain-updates.json",
      "chain": [
        {
          "id": "upstream",
          "title": "上游：精密材料与制程耗材",
          "role": "决定容量、耐压、可靠性和产品良率",
          "items": [
            {
              "name": "陶瓷粉体",
              "detail": "钛酸钡、改性粉体、高容/车规介质材料",
              "companies": "国瓷材料"
            },
            {
              "name": "电极浆料",
              "detail": "镍粉、银浆、铜浆，影响内外电极成本与导入",
              "companies": "博迁新材、聚和材料"
            },
            {
              "name": "离型膜",
              "detail": "流延承载耗材，薄层高容产品良率关键",
              "companies": "洁美科技"
            },
            {
              "name": "精密设备",
              "detail": "流延、印刷、叠层、烧结、端接",
              "companies": "制程良率瓶颈"
            }
          ]
        },
        {
          "id": "midstream",
          "title": "中游：MLCC制造",
          "role": "把陶瓷介质层与金属内电极交替堆叠成多层电容器",
          "items": [
            {
              "name": "消费/车规MLCC",
              "detail": "高容、小尺寸、高压、车规认证",
              "companies": "三环集团、风华高科、微容科技"
            },
            {
              "name": "特种军工MLCC",
              "detail": "高可靠、宇航级、防务客户",
              "companies": "宏达电子、宏明电子、火炬电子、鸿远电子"
            },
            {
              "name": "射频微波MLCC",
              "detail": "高频性能要求，细分高毛利赛道",
              "companies": "达利凯普"
            }
          ]
        },
        {
          "id": "downstream",
          "title": "下游：终端应用",
          "role": "AI服务器和新能源车是本轮结构性增量核心",
          "items": [
            {
              "name": "AI服务器",
              "detail": "用量8-12倍，价值量显著提升",
              "companies": "数据中心、GPU服务器、电源模块"
            },
            {
              "name": "新能源汽车",
              "detail": "纯电车单车用量约燃油车6倍，车规认证壁垒高",
              "companies": "电驱、BMS、ADAS、信息娱乐"
            },
            {
              "name": "其他应用",
              "detail": "5G通信、消费电子、工业控制、军工航天",
              "companies": "消费电子是基本盘，规格升级贡献增量"
            }
          ]
        }
      ],
      "logic": [
        {
          "title": "AI算力需求爆发",
          "body": "AI服务器MLCC用量和价值量双重提升，高端MLCC成为关键被动元件成本项。"
        },
        {
          "title": "新能源车长坡厚雪",
          "body": "纯电车单车MLCC用量显著高于燃油车，车规认证周期长，客户绑定稳定。"
        },
        {
          "title": "供给紧张与涨价",
          "body": "高端扩产受限，日韩龙头产能利用率高，高端MLCC涨价带动行业景气上行。"
        },
        {
          "title": "国产替代窗口",
          "body": "国产份额仍低，高端材料和制造持续突破，中低端外溢与高端认证双线推进。"
        }
      ],
      "watchlist": [
        {
          "segment": "陶瓷粉体",
          "signals": [
            "粉体价格",
            "AI服务器验证",
            "车规客户导入",
            "扩产节奏"
          ],
          "companies": "国瓷材料"
        },
        {
          "segment": "电极浆料",
          "signals": [
            "三星电机订单",
            "台系客户送样",
            "小批量供货",
            "盈利修复"
          ],
          "companies": "博迁新材、聚和材料"
        },
        {
          "segment": "离型膜",
          "signals": [
            "三星/村田验证",
            "高端离型膜盈利",
            "良率",
            "出货占比"
          ],
          "companies": "洁美科技"
        },
        {
          "segment": "MLCC制造",
          "signals": [
            "高端订单",
            "ASP涨价",
            "产能利用率",
            "国产替代份额"
          ],
          "companies": "三环集团、风华高科、宏达电子、宏明电子、火炬电子、鸿远电子、达利凯普"
        }
      ],
      "updates": [
        {
          "date": "2026-06-04",
          "segment": "全产业链",
          "signal": "建立MLCC产业链基准逻辑",
          "impact": "以AI服务器和新能源车需求共振为主线，追踪材料、制造、终端应用的涨价、扩产、认证和国产替代变化。",
          "confidence": "基准框架",
          "sourceTitle": "MLCC产业链深度解析原始稿",
          "sourceUrl": "./content/raw/mlcc-industry-chain-original.md",
          "notes": "初始版本来自用户提供文章，尚未做逐项外部核验。"
        }
      ]
    },
    {
      "id": "lithography",
      "title": "光刻机产业链",
      "shortTitle": "光刻机",
      "theme": "AI芯片扩产与自主可控共振，光学、光源、电子特气、真空结构件和整机制造进入国产替代深水区。",
      "status": "已建档",
      "trackingProfile": {
        "title": "光刻机专属动态追踪",
        "summary": "重点看整机交付是否拉动核心零部件验证，以及AI晶圆厂资本开支是否继续放大国产替代窗口。",
        "metrics": [
          {
            "name": "SMEE整机交付",
            "why": "上海微电子的28nm DUV交付和验证是整条国产光刻机链条的核心催化。",
            "signals": [
              "SSA800交付",
              "量产良率",
              "国产化率",
              "IPO/重组进展"
            ]
          },
          {
            "name": "光学系统认证",
            "why": "投影物镜、光学晶体和光束整形决定成像能力，是最难替代的核心子系统之一。",
            "signals": [
              "物镜交付",
              "半导体订单占比",
              "ASML/SMEE供应",
              "扩产折旧"
            ]
          },
          {
            "name": "光源系统突破",
            "why": "ArF准分子光源和匀化器是DUV光刻效率、稳定性和良率的关键。",
            "signals": [
              "准分子激光器",
              "光场匀化器",
              "科益虹源进展",
              "客户验证"
            ]
          },
          {
            "name": "电子特气认证",
            "why": "光刻气认证门槛高，ASML/GIGAPHOTON认证直接决定稀缺性和溢价。",
            "signals": [
              "ASML认证",
              "GIGAPHOTON认证",
              "光刻气放量",
              "价格传导"
            ]
          },
          {
            "name": "直写光刻订单",
            "why": "直写光刻与传统投影式路线互补，受益先进封装、载板和PCB直接成像。",
            "signals": [
              "累计订单",
              "先进封装客户",
              "线宽能力",
              "PCB/载板设备放量"
            ]
          }
        ]
      },
      "article": "./content/raw/lithography-industry-chain-original.md",
      "cover": "./cover-image/lithography-industry-chain/lithography-industry-chain-cover.png",
      "diagram": "./diagram/lithography-industry-chain/lithography-industry-chain-map@2x.png",
      "diagramSvg": "./diagram/lithography-industry-chain/lithography-industry-chain-map.svg",
      "updateFile": "./content/updates/lithography-chain-updates.json",
      "chain": [
        {
          "id": "upstream",
          "title": "上游：核心零部件及材料",
          "role": "光刻机技术壁垒最高、国产替代最慢的深水区",
          "items": [
            {
              "name": "光学系统",
              "detail": "投影物镜、棱镜、光学晶体、光束整形",
              "companies": "茂莱光学、福晶科技、波长光电"
            },
            {
              "name": "光源系统",
              "detail": "ArF准分子激光器、光场匀化器、照明模组",
              "companies": "炬光科技、科益虹源"
            },
            {
              "name": "真空结构件/温控",
              "detail": "高洁净腔体、高纯管路、精密零部件、温控液冷",
              "companies": "新莱应材、富创精密、同飞股份"
            },
            {
              "name": "电子特气",
              "detail": "光刻气、ASML/GIGAPHOTON认证、半导体工艺耗材",
              "companies": "中船特气、华特气体"
            }
          ]
        },
        {
          "id": "midstream",
          "title": "中游：整机制造",
          "role": "将光源、光学、掩膜台、工件台等模块集成为曝光设备",
          "items": [
            {
              "name": "传统投影式光刻机",
              "detail": "前道光刻机主线，掩膜版投影至晶圆",
              "companies": "上海微电子 SMEE"
            },
            {
              "name": "整机间接卡位",
              "detail": "通过参股SMEE分享国产整机突破催化",
              "companies": "张江高科、上海电气"
            },
            {
              "name": "直写光刻路线",
              "detail": "无需掩膜版，面向PCB、先进封装、载板、掩模版制板",
              "companies": "芯碁微装"
            }
          ]
        },
        {
          "id": "downstream",
          "title": "下游：晶圆制造与先进封装",
          "role": "AI芯片、存储和先进封装资本开支决定设备需求",
          "items": [
            {
              "name": "晶圆代工",
              "detail": "逻辑制程扩产，成熟与先进节点并行",
              "companies": "中芯国际、华虹集团"
            },
            {
              "name": "存储IDM",
              "detail": "DRAM、NAND、HBM相关扩产",
              "companies": "长鑫科技、长江存储"
            },
            {
              "name": "先进封装",
              "detail": "2.5D/3D、载板、封装测试、量检测",
              "companies": "先进封装厂、载板厂、测试厂"
            }
          ]
        }
      ],
      "logic": [
        {
          "title": "AI算力拉动CAPEX",
          "body": "GPU、HBM、ASIC需求推动晶圆厂和存储厂设备支出，光刻设备是扩产核心环节。"
        },
        {
          "title": "国产替代深水区",
          "body": "光刻机国产化率低，整机突破会带动光学、光源、真空、特气等核心零部件价值重估。"
        },
        {
          "title": "政策与认证催化",
          "body": "自主可控政策倾斜叠加ASML/GIGAPHOTON等认证，决定供应链稀缺性和导入节奏。"
        },
        {
          "title": "直写光刻互补放量",
          "body": "芯碁微装代表的直写光刻路线受益先进封装、载板和PCB直接成像，与传统投影式光刻互补。"
        }
      ],
      "watchlist": [
        {
          "segment": "光学系统",
          "signals": [
            "SMEE/ASML供应链进展",
            "半导体订单占比",
            "投影物镜交付",
            "扩产折旧与毛利率"
          ],
          "companies": "茂莱光学、福晶科技、波长光电"
        },
        {
          "segment": "光源系统",
          "signals": [
            "光源模块验证",
            "核心元器件订单",
            "国产DUV光源进展",
            "国际龙头供应关系"
          ],
          "companies": "炬光科技、科益虹源"
        },
        {
          "segment": "精密结构件与真空温控",
          "signals": [
            "半导体设备客户",
            "光刻机配套占比",
            "新增产能",
            "净利润兑现"
          ],
          "companies": "新莱应材、富创精密、同飞股份"
        },
        {
          "segment": "电子特气",
          "signals": [
            "国际认证",
            "光刻气放量",
            "产能利用率",
            "价格与原料传导"
          ],
          "companies": "中船特气、华特气体"
        },
        {
          "segment": "整机制造",
          "signals": [
            "批量交付",
            "量产良率",
            "国产化率",
            "上市/重组进展"
          ],
          "companies": "上海微电子、张江高科、上海电气"
        },
        {
          "segment": "直写光刻",
          "signals": [
            "累计订单",
            "先进封装客户",
            "线宽能力",
            "PCB/载板设备放量"
          ],
          "companies": "芯碁微装"
        }
      ],
      "updates": [
        {
          "date": "2026-06-04",
          "segment": "全产业链",
          "signal": "建立光刻机产业链基准逻辑",
          "impact": "以AI芯片扩产、自主可控和SMEE整机突破为主线，追踪光学、光源、真空结构件、电子特气、整机制造和直写光刻路线变化。",
          "confidence": "基准框架",
          "sourceTitle": "光刻机产业链深度解析原始稿",
          "sourceUrl": "./content/raw/lithography-industry-chain-original.md",
          "notes": "初始版本来自用户提供文章，尚未做逐项外部核验。"
        },
        {
          "date": "2026-06-04",
          "segment": "板块催化",
          "signal": "光刻机概念板块震荡走强，电子特气与核心零部件领涨",
          "impact": "市场短期将电子特气、精密零部件、光学系统和直写光刻视为国产替代最具弹性的方向。",
          "confidence": "待核验",
          "sourceTitle": "2026年6月4日板块热点回顾",
          "sourceUrl": "./content/raw/lithography-industry-chain-original.md",
          "notes": "需后续核验中船特气、华特气体、新莱应材、芯碁微装等涨幅及资金流数据。"
        }
      ]
    },
    {
      "id": "photoresist",
      "title": "光刻胶产业链",
      "shortTitle": "光刻胶",
      "theme": "AI芯片扩产推动ArF/KrF高端胶量价齐升，上游树脂、光引发剂、光刻气与中游三巨头进入国产替代验证窗口。",
      "status": "已建档",
      "trackingProfile": {
        "title": "光刻胶专属动态追踪",
        "summary": "重点看ArF/KrF验证放量、上游树脂和光引发剂国产化、光刻气认证以及涨价传导是否进入业绩兑现。",
        "metrics": [
          {
            "name": "ArF/KrF客户验证",
            "why": "光刻胶验证周期长，率先稳定量产的企业会获得本轮国产替代最大份额。",
            "signals": [
              "客户验证通过",
              "量产收入",
              "ArF/ArFi进展",
              "KrF市占率"
            ]
          },
          {
            "name": "树脂国产化",
            "why": "树脂是光刻胶成膜核心，KrF/ArF树脂突破决定中游材料自主化能力。",
            "signals": [
              "百吨级产能",
              "扩产进度",
              "客户锁定",
              "单吨毛利"
            ]
          },
          {
            "name": "光引发剂突破",
            "why": "光引发剂决定光敏反应，高端半导体PAG国产化仍是关键难点。",
            "signals": [
              "半导体验证",
              "新产线投产",
              "PCB/LCD现金流",
              "高端PAG进展"
            ]
          },
          {
            "name": "光刻气认证",
            "why": "光刻气认证稀缺，ASML/GIGAPHOTON双认证提升供应链议价能力。",
            "signals": [
              "双认证",
              "光刻混合气收入",
              "先进制程客户",
              "价格传导"
            ]
          },
          {
            "name": "材料包协同",
            "why": "平台型公司通过光刻胶、蚀刻液、CMP、清洗液协同进入晶圆厂材料包。",
            "signals": [
              "半导体收入占比",
              "扣非净利",
              "材料包订单",
              "产能扩张"
            ]
          }
        ]
      },
      "article": "./content/raw/photoresist-industry-chain-original.md",
      "cover": "./cover-image/photoresist-industry-chain/photoresist-industry-chain-cover.png",
      "diagram": "./diagram/photoresist-industry-chain/photoresist-industry-chain-map@2x.png",
      "diagramSvg": "./diagram/photoresist-industry-chain/photoresist-industry-chain-map.svg",
      "updateFile": "./content/updates/photoresist-chain-updates.json",
      "chain": [
        {
          "id": "upstream",
          "title": "上游：核心原材料",
          "role": "决定光刻胶性能的基因层，技术壁垒最高",
          "items": [
            {
              "name": "特种气体",
              "detail": "光刻气、ASML/GIGAPHOTON认证、先进制程耗材",
              "companies": "华特气体"
            },
            {
              "name": "树脂",
              "detail": "KrF/ArF成膜材料，占成本20%-40%",
              "companies": "八亿时空"
            },
            {
              "name": "光引发剂",
              "detail": "光敏反应核心，PCB/LCD/半导体体系差异大",
              "companies": "强力新材、兴福电子"
            },
            {
              "name": "溶剂/单体/添加剂",
              "detail": "影响配方稳定性、纯度和良率",
              "companies": "精密化工材料供应链"
            }
          ]
        },
        {
          "id": "midstream",
          "title": "中游：光刻胶制造",
          "role": "从PCB/LCD到半导体g线、i线、KrF、ArF、EUV逐级升级",
          "items": [
            {
              "name": "半导体光刻胶三巨头",
              "detail": "KrF、ArF、全品类材料包协同",
              "companies": "彤程新材、南大光电、上海新阳"
            },
            {
              "name": "综合品类参与者",
              "detail": "高纯化学品、光刻胶、锂电材料等均衡布局",
              "companies": "晶瑞电材"
            },
            {
              "name": "材料平台",
              "detail": "CMP抛光垫、显示材料、光刻胶、先进封装材料协同",
              "companies": "鼎龙股份"
            }
          ]
        },
        {
          "id": "downstream",
          "title": "下游：晶圆制造应用",
          "role": "AI芯片、存储和先进封装决定高端胶需求弹性",
          "items": [
            {
              "name": "晶圆代工",
              "detail": "逻辑芯片、AI芯片、先进制程多重曝光",
              "companies": "中芯国际、华虹等晶圆厂"
            },
            {
              "name": "存储IDM",
              "detail": "DRAM、NAND、HBM扩产拉动KrF/ArF需求",
              "companies": "长鑫、长江存储等"
            },
            {
              "name": "先进封装/显示/PCB",
              "detail": "基础盘与高端增量并存",
              "companies": "封装厂、面板厂、PCB厂"
            }
          ]
        }
      ],
      "logic": [
        {
          "title": "供需缺口与涨价",
          "body": "日本企业主导高端供给，断供预警和AI需求推动ArF/KrF光刻胶涨价。"
        },
        {
          "title": "国产替代验证窗口",
          "body": "KrF国产化率约10%，ArF不足2%，大厂开放验证后窗口快速关闭。"
        },
        {
          "title": "AI芯片高端化",
          "body": "先进制程和多重曝光提升单颗芯片高端光刻胶用量，带动量价齐升。"
        },
        {
          "title": "全产业链共振",
          "body": "气体、树脂、光引发剂、光刻胶制造同步突破，平台型材料公司享受材料包协同。"
        }
      ],
      "watchlist": [
        {
          "segment": "光刻气/特种气体",
          "signals": [
            "双认证进展",
            "光刻混合气收入",
            "价格传导",
            "先进制程客户"
          ],
          "companies": "华特气体"
        },
        {
          "segment": "树脂",
          "signals": [
            "产能爬坡",
            "客户订单",
            "单吨毛利",
            "KrF/ArF树脂验证"
          ],
          "companies": "八亿时空"
        },
        {
          "segment": "光引发剂",
          "signals": [
            "半导体验证",
            "30吨产线投产",
            "经营现金流",
            "高端PAG突破"
          ],
          "companies": "强力新材、兴福电子"
        },
        {
          "segment": "半导体光刻胶",
          "signals": [
            "客户验证",
            "量产收入",
            "涨价幅度",
            "国产化率",
            "大基金支持"
          ],
          "companies": "彤程新材、南大光电、上海新阳、晶瑞电材"
        },
        {
          "segment": "材料平台",
          "signals": [
            "材料包协同",
            "半导体收入占比",
            "扣非净利",
            "产能扩张"
          ],
          "companies": "鼎龙股份、上海新阳"
        }
      ],
      "updates": [
        {
          "date": "2026-06-04",
          "segment": "全产业链",
          "signal": "建立光刻胶产业链基准逻辑",
          "impact": "以AI芯片扩产、ArF/KrF高端胶涨价和国产替代验证窗口为主线，追踪上游树脂、光引发剂、特种气体和中游光刻胶制造变化。",
          "confidence": "基准框架",
          "sourceTitle": "光刻胶产业链深度解析原始稿",
          "sourceUrl": "./content/raw/photoresist-industry-chain-original.md",
          "notes": "初始版本来自用户提供文章，尚未做逐项外部核验。"
        },
        {
          "date": "2026-06-04",
          "segment": "板块催化",
          "signal": "光刻胶概念持续走强，资金关注ArF/KrF量产与上游材料国产替代",
          "impact": "市场开始从主题预期转向验证进度、订单放量和业绩兑现，三巨头及上游树脂、光刻气环节成为主要观察对象。",
          "confidence": "待核验",
          "sourceTitle": "2026年6月近期板块行情",
          "sourceUrl": "./content/raw/photoresist-industry-chain-original.md",
          "notes": "需后续核验鼎龙股份、南大光电、华特气体等资金流与涨幅数据。"
        }
      ]
    },
    {
      "id": "robotics",
      "title": "机器人产业链",
      "shortTitle": "机器人",
      "theme": "2026人形机器人量产元年，特斯拉链、英伟达链、华为链并行推进，核心零部件厂商进入订单验证窗口。",
      "status": "已建档",
      "trackingProfile": {
        "title": "机器人专属动态追踪",
        "summary": "重点看Optimus量产、GR00T开放生态、华为具身大脑，以及执行器、减速器、丝杠、灵巧手和传感器的订单兑现。",
        "metrics": [
          {
            "name": "Optimus量产节奏",
            "why": "特斯拉Gen3投产决定T链零部件订单兑现速度。",
            "signals": [
              "Gen3投产",
              "上海/弗里蒙特产能",
              "供应链订单",
              "BOM降本"
            ]
          },
          {
            "name": "执行器与丝杠",
            "why": "执行器和丝杠是人形机器人价值量最高、弹性最大的环节。",
            "signals": [
              "执行器订单",
              "行星滚柱丝杠",
              "微型丝杠",
              "产能扩张"
            ]
          },
          {
            "name": "减速器路线",
            "why": "谐波、RV、行星多路线并行，需跟踪路线变化和价格竞争。",
            "signals": [
              "谐波减速器",
              "RV供货",
              "关节模组",
              "毛利率"
            ]
          },
          {
            "name": "灵巧手与传感器",
            "why": "灵巧手和感知层决定机器人从搬运走向精细操作。",
            "signals": [
              "空心杯电机",
              "六维力传感器",
              "3D视觉",
              "电子皮肤"
            ]
          },
          {
            "name": "NV链与华为链",
            "why": "开放平台和通用大脑可能重塑本体厂与零部件厂的生态分工。",
            "signals": [
              "GR00T",
              "宇树IPO",
              "鸿蒙具身大脑",
              "华为合作伙伴"
            ]
          }
        ]
      },
      "article": "./content/raw/robotics-industry-chain-original.md",
      "cover": "./cover-image/robotics-industry-chain/robotics-industry-chain-cover.png",
      "diagram": "./diagram/robotics-industry-chain/robotics-industry-chain-map@2x.png",
      "diagramSvg": "./diagram/robotics-industry-chain/robotics-industry-chain-map.svg",
      "updateFile": "./content/updates/robotics-chain-updates.json",
      "chain": [
        {
          "id": "upstream",
          "title": "上游：核心零部件",
          "role": "决定成本、精度、可靠性和量产良率",
          "items": [
            {
              "name": "执行器总成",
              "detail": "旋转/直线关节，单机BOM价值最高",
              "companies": "三花智控、拓普集团"
            },
            {
              "name": "减速器",
              "detail": "谐波、RV、行星多路线并行",
              "companies": "绿的谐波、双环传动、中大力德"
            },
            {
              "name": "电机/丝杠/灵巧手",
              "detail": "空心杯电机、行星滚柱丝杠、微型传动",
              "companies": "鸣志电器、五洲新春、兆威机电"
            },
            {
              "name": "传感器/结构件",
              "detail": "3D视觉、六维力、电子皮肤、壳体与组装",
              "companies": "奥比中光、柯力传感、福莱新材、蓝思科技"
            }
          ]
        },
        {
          "id": "midstream",
          "title": "中游：本体与生态链",
          "role": "三条生态链并行，决定机器人系统集成和商业化路径",
          "items": [
            {
              "name": "特斯拉链",
              "detail": "Optimus Gen3，垂直整合量产路线",
              "companies": "特斯拉及T链供应商"
            },
            {
              "name": "英伟达链",
              "detail": "GR00T、Jetson Thor、Isaac开放平台",
              "companies": "英伟达、宇树科技、Sharpa"
            },
            {
              "name": "华为链",
              "detail": "鸿蒙具身大脑，通用操作系统赋能本体厂",
              "companies": "华为、乐聚、兆威、拓斯达、埃斯顿"
            }
          ]
        },
        {
          "id": "downstream",
          "title": "下游：商业化落地",
          "role": "从舞台展示走向工厂、仓储和服务场景稳定作业",
          "items": [
            {
              "name": "工厂制造",
              "detail": "汽车厂、电子厂、装配、搬运、巡检",
              "companies": "特斯拉、比亚迪、蔚来等"
            },
            {
              "name": "仓储物流",
              "detail": "搬运、分拣、无人仓、配送",
              "companies": "量产早期优先场景"
            },
            {
              "name": "商业/家庭服务",
              "detail": "商业接待、家庭助理、工业机器人上云",
              "companies": "长期空间更大，商业化仍需验证"
            }
          ]
        }
      ],
      "logic": [
        {
          "title": "2026量产元年",
          "body": "人形机器人从主题投资进入订单验证阶段，核心零部件估值体系从PS向PE切换。"
        },
        {
          "title": "三条生态链并行",
          "body": "T链重量产，NV链重开放平台，华为链重通用大脑，A股按生态卡位分化。"
        },
        {
          "title": "中国供应链优势",
          "body": "执行器、减速器、丝杠、灵巧手、传感器等环节具备成本与制造优势。"
        },
        {
          "title": "技术路线快速迭代",
          "body": "关节方案、灵巧手传动、传感器路线仍在变化，需要持续跟踪被替代风险。"
        }
      ],
      "watchlist": [
        {
          "segment": "特斯拉链",
          "signals": [
            "Gen3投产",
            "订单确认",
            "墨西哥/上海产能",
            "执行器和丝杠BOM价值量"
          ],
          "companies": "三花智控、拓普集团、绿的谐波、五洲新春、鸣志电器、奥比中光"
        },
        {
          "segment": "减速器",
          "signals": [
            "T链/NV链卡位",
            "产能扩张",
            "毛利率",
            "机器人业务占比"
          ],
          "companies": "绿的谐波、双环传动、中大力德"
        },
        {
          "segment": "电机与灵巧手",
          "signals": [
            "小批量供货",
            "灵巧手模组订单",
            "微型丝杠份额",
            "自由度升级"
          ],
          "companies": "鸣志电器、兆威机电、江苏雷利、浙江荣泰"
        },
        {
          "segment": "传感器",
          "signals": [
            "客户验证",
            "批量供应",
            "电子皮肤中试",
            "英伟达/特斯拉生态合作"
          ],
          "companies": "奥比中光、柯力传感、安培龙、芯动联科、福莱新材"
        },
        {
          "segment": "英伟达链",
          "signals": [
            "GR00T平台进展",
            "宇树IPO",
            "参考设计量产",
            "开放生态合作"
          ],
          "companies": "宇树科技、绿的谐波、双环传动、汇川技术、奥比中光"
        },
        {
          "segment": "华为链",
          "signals": [
            "华为生态合作",
            "工业机器人落地",
            "通用操作系统适配",
            "业绩兑现"
          ],
          "companies": "兆威机电、拓斯达、埃斯顿"
        }
      ],
      "updates": [
        {
          "date": "2026-06-04",
          "segment": "全产业链",
          "signal": "建立机器人产业链基准逻辑",
          "impact": "以2026人形机器人量产元年为主线，追踪特斯拉链、英伟达链、华为链及核心零部件放量节奏。",
          "confidence": "基准框架",
          "sourceTitle": "机器人产业链深度解析原始稿",
          "sourceUrl": "./content/raw/robotics-industry-chain-original.md",
          "notes": "初始版本来自用户提供文章，尚未做逐项外部核验。"
        }
      ]
    },
    {
      "id": "intelligent-driving",
      "title": "智能驾驶产业链",
      "shortTitle": "智能驾驶",
      "theme": "FSD入华、L3量产和高阶智驾下沉共振，感知、决策、执行、网联四层进入规模化商用拐点。",
      "status": "已建档",
      "trackingProfile": {
        "title": "智能驾驶专属动态追踪",
        "summary": "重点看FSD入华、L3准入、高阶智驾渗透、感知硬件用量、域控制器订单、线控底盘和车路云招标。",
        "metrics": [
          {
            "name": "FSD与L3政策",
            "why": "FSD入华和L3准入是智驾产业从示范走向规模化商用的催化剂。",
            "signals": [
              "FSD上线范围",
              "L3准入车型",
              "L2强制国标",
              "Robotaxi试点"
            ]
          },
          {
            "name": "感知硬件用量",
            "why": "摄像头、CIS、激光雷达和毫米波雷达直接受益高阶智驾单车价值量提升。",
            "signals": [
              "8MP镜头",
              "车载CIS",
              "激光雷达出货",
              "毫米波雷达国产化"
            ]
          },
          {
            "name": "域控和智驾芯片",
            "why": "决策层是智驾“大脑”，高算力平台订单决定产业链核心价值分配。",
            "signals": [
              "NOA搭载率",
              "域控市占率",
              "高算力芯片",
              "舱驾一体"
            ]
          },
          {
            "name": "线控底盘与车路云",
            "why": "L3及以上需要可靠执行和网联协同，线控制动、V2X招标是放量信号。",
            "signals": [
              "EMB定点",
              "WCBS出货",
              "V2X招标",
              "RSU/OBU出货"
            ]
          }
        ]
      },
      "article": "./content/raw/intelligent-driving-industry-chain-original.md",
      "cover": "./cover-image/intelligent-driving-industry-chain/intelligent-driving-industry-chain-cover.png",
      "diagram": "./diagram/intelligent-driving-industry-chain/intelligent-driving-industry-chain-map@2x.png",
      "diagramSvg": "./diagram/intelligent-driving-industry-chain/intelligent-driving-industry-chain-map.svg",
      "updateFile": "./content/updates/intelligent-driving-chain-updates.json",
      "chain": [
        {
          "id": "perception",
          "title": "感知层",
          "role": "车辆的眼睛，负责采集环境信息，是高阶智驾单车价值量提升最直观的环节。",
          "items": [
            {
              "name": "摄像头/车载镜头",
              "detail": "8MP ADAS镜头、全玻璃镜头、FSD纯视觉核心入口",
              "companies": "舜宇光学、联创电子、欧菲光"
            },
            {
              "name": "车载CIS",
              "detail": "摄像头感光芯片，高动态和抗闪烁能力重要",
              "companies": "韦尔股份、思特威-W"
            },
            {
              "name": "激光雷达/毫米波雷达",
              "detail": "L3深度感知和多传感器融合核心",
              "companies": "禾赛科技、速腾聚创、承泰科技"
            }
          ]
        },
        {
          "id": "decision",
          "title": "决策层",
          "role": "车辆的大脑，处理感知数据并输出驾驶决策。",
          "items": [
            {
              "name": "智驾芯片",
              "detail": "高算力SoC，NOA赛道份额集中",
              "companies": "地平线、英伟达、华为"
            },
            {
              "name": "域控制器",
              "detail": "集成感知处理、决策规划和控制输出",
              "companies": "德赛西威、经纬恒润-W"
            }
          ]
        },
        {
          "id": "execution",
          "title": "执行层",
          "role": "车辆的手脚，把决策指令转换为制动、转向和悬架动作。",
          "items": [
            {
              "name": "线控制动",
              "detail": "EHB/WCBS/EMB，L3及以上关键执行基础",
              "companies": "伯特利、亚太股份"
            },
            {
              "name": "线控底盘",
              "detail": "XYZ三轴解决方案，电子信号替代机械/液压连接",
              "companies": "伯特利等"
            }
          ]
        },
        {
          "id": "connected",
          "title": "网联层",
          "role": "车路云协同，提供超视距感知和多车协同能力。",
          "items": [
            {
              "name": "高精地图/定位",
              "detail": "地图、芯片、算法、数据协同",
              "companies": "四维图新"
            },
            {
              "name": "V2X/RSU/OBU",
              "detail": "路侧、车载和云端平台协同",
              "companies": "金溢科技、万集科技"
            }
          ]
        }
      ],
      "logic": [
        {
          "title": "FSD入华催化",
          "body": "特斯拉FSD监督版入华形成鲶鱼效应，倒逼国内车企加速高阶智驾迭代。"
        },
        {
          "title": "L3量产启动",
          "body": "L3准入车型获批上路，行业从示范运营迈向规模化商用。"
        },
        {
          "title": "高阶智驾下沉",
          "body": "10万级车型开始搭载高阶方案，感知硬件、域控和线控底盘单车价值量提升。"
        },
        {
          "title": "车路云协同",
          "body": "单车智能之外，V2X和路侧设施成为政策与城市试点的重要方向。"
        }
      ],
      "watchlist": [
        {
          "segment": "FSD与高阶智驾政策",
          "signals": [
            "FSD入华落地进度",
            "L2强制国标",
            "L3准入名单",
            "高阶智驾渗透率"
          ],
          "companies": "德赛西威、联创电子、韦尔股份、伯特利"
        },
        {
          "segment": "感知层",
          "signals": [
            "8MP ADAS镜头搭载",
            "车载CIS份额",
            "激光雷达出货",
            "毫米波雷达国产化"
          ],
          "companies": "舜宇光学、联创电子、韦尔股份、思特威-W、禾赛科技、速腾聚创"
        },
        {
          "segment": "决策层",
          "signals": [
            "高算力芯片市占率",
            "域控制器订单",
            "舱驾一体量产",
            "NOA搭载率"
          ],
          "companies": "地平线、德赛西威、经纬恒润-W"
        },
        {
          "segment": "执行层",
          "signals": [
            "EHB/WCBS出货",
            "EMB定点",
            "线控转向",
            "经营现金流"
          ],
          "companies": "伯特利、亚太股份"
        },
        {
          "segment": "车路云网联",
          "signals": [
            "高精地图订单",
            "V2X路侧招标",
            "RSU/OBU出货",
            "车路云试点"
          ],
          "companies": "四维图新、金溢科技、万集科技"
        }
      ],
      "updates": [
        {
          "date": "2026-06-04",
          "segment": "全产业链",
          "signal": "建立智能驾驶产业链基准框架",
          "impact": "以“感知层 → 决策层 → 执行层 → 网联层”为主线归档，后续动态围绕FSD入华、L3准入、高阶智驾渗透、域控订单和线控底盘放量更新。",
          "confidence": "基准框架",
          "sourceTitle": "智能驾驶产业链深度解析原始稿",
          "sourceUrl": "./content/raw/intelligent-driving-industry-chain-original.md",
          "notes": "初始版本来自用户提供文章，尚未做逐项外部核验。"
        },
        {
          "date": "2026-06-04",
          "segment": "FSD催化",
          "signal": "待核验：特斯拉FSD监督版2026年5月入华落地",
          "impact": "若落地节奏持续推进，将倒逼国内高阶智驾功能标配化，并拉动8MP摄像头、CIS、域控制器和线控底盘等环节需求。",
          "confidence": "待核验",
          "sourceTitle": "用户提供的智能驾驶产业链文章",
          "sourceUrl": "./content/raw/intelligent-driving-industry-chain-original.md",
          "notes": "后续需要核验上线范围、定价、法规状态、车型适配和供应链订单兑现情况。"
        }
      ]
    },
    {
      "id": "semiconductor",
      "title": "半导体产业链",
      "shortTitle": "半导体",
      "theme": "WSTS上修、存储暴增、国产替代和大基金三期共振，设计、制造、封测、设备、材料进入超级上行周期。",
      "status": "已建档",
      "trackingProfile": {
        "title": "半导体总览动态追踪",
        "summary": "作为半导体母篇，重点追踪全球周期、AI算力、存储涨价、国产替代导入、先进封装和设备材料验证。",
        "metrics": [
          {
            "name": "全球市场与存储周期",
            "why": "WSTS预测和存储价格决定半导体总景气，是母篇最重要的周期温度计。",
            "signals": [
              "WSTS修订",
              "DRAM/NAND价格",
              "HBM供需",
              "库存水位"
            ]
          },
          {
            "name": "国产替代导入",
            "why": "设备、材料、EDA和晶圆制造导入进度决定估值从主题走向订单兑现。",
            "signals": [
              "客户验证",
              "国产化率",
              "晶圆厂导入",
              "大基金投资"
            ]
          },
          {
            "name": "先进封装与AI芯片",
            "why": "CoWoS、HBM封装和AI芯片出货决定半导体景气最强结构性主线。",
            "signals": [
              "CoWoS产能",
              "HBM封装订单",
              "AI芯片出货",
              "资本开支"
            ]
          },
          {
            "name": "设备材料瓶颈",
            "why": "光刻、量检测、高端光刻胶、电子特气等瓶颈环节决定国产替代上限。",
            "signals": [
              "刻蚀/薄膜沉积订单",
              "光刻机进展",
              "光刻胶认证",
              "特气认证"
            ]
          }
        ]
      },
      "article": "./content/raw/semiconductor-industry-chain-original.md",
      "cover": "./cover-image/semiconductor-industry-chain/semiconductor-industry-chain-cover.png",
      "diagram": "./diagram/semiconductor-industry-chain/semiconductor-industry-chain-map@2x.png",
      "diagramSvg": "./diagram/semiconductor-industry-chain/semiconductor-industry-chain-map.svg",
      "updateFile": "./content/updates/semiconductor-chain-updates.json",
      "chain": [
        {
          "id": "design",
          "title": "芯片设计",
          "role": "定义芯片功能和性能，是AI与国产替代的技术策源地。",
          "items": [
            {
              "name": "EDA工具",
              "detail": "模拟/全定制领先，数字全流程仍需突破",
              "companies": "华大九天"
            },
            {
              "name": "模拟/MCU/存储设计",
              "detail": "库存出清后利润修复，AI端侧和服务器拉动用量",
              "companies": "圣邦股份、兆易创新、思瑞浦、纳芯微"
            },
            {
              "name": "CIS/射频/AI芯片",
              "detail": "手机、汽车与智算中心驱动结构升级",
              "companies": "韦尔股份、卓胜微、海光信息、寒武纪"
            }
          ]
        },
        {
          "id": "manufacturing",
          "title": "晶圆制造",
          "role": "资本最密集、工艺最难的产业链胜负手。",
          "items": [
            {
              "name": "先进制程与成熟制程",
              "detail": "先进节点追赶，成熟特色工艺产能利用率改善",
              "companies": "中芯国际、华虹公司"
            },
            {
              "name": "IDM特色工艺",
              "detail": "功率器件、模拟、电源管理、新能源车与工业需求拉动",
              "companies": "华润微、士兰微"
            }
          ]
        },
        {
          "id": "packaging",
          "title": "封装测试",
          "role": "先进封装成为AI时代第二增长曲线。",
          "items": [
            {
              "name": "传统封测复苏",
              "detail": "成熟工厂订单饱满，产能利用率高位运行",
              "companies": "长电科技、通富微电"
            },
            {
              "name": "先进封装",
              "detail": "CoWoS、HBM、2.5D/3D封装供需紧张",
              "companies": "长电科技、通富微电"
            }
          ]
        },
        {
          "id": "equipment",
          "title": "半导体设备",
          "role": "国产替代核心抓手，订单红利率先兑现。",
          "items": [
            {
              "name": "刻蚀/薄膜沉积/清洗",
              "detail": "国产化率持续提升，部分设备进入国际先进产线",
              "companies": "中微公司、北方华创、拓荆科技、盛美上海"
            },
            {
              "name": "高难度设备",
              "detail": "光刻、量检测、离子注入仍是国产化瓶颈",
              "companies": "中科飞测、芯源微等"
            }
          ]
        },
        {
          "id": "materials",
          "title": "半导体材料",
          "role": "产业链粮食端，高端品类替代空间最大。",
          "items": [
            {
              "name": "硅片/CMP/特气",
              "detail": "晶圆厂扩产带动基础材料与耗材需求",
              "companies": "沪硅产业、安集科技、华特气体、中船特气"
            },
            {
              "name": "光刻胶/靶材/湿电子化学品",
              "detail": "高端材料国产化率低，验证周期长",
              "companies": "彤程新材、南大光电、江丰电子等"
            }
          ]
        }
      ],
      "logic": [
        {
          "title": "全球周期上修",
          "body": "WSTS预测大幅上调，存储成为增长最强引擎，带动全产业链景气预期重估。"
        },
        {
          "title": "AI算力结构性拉动",
          "body": "AI芯片、HBM、先进封装、光模块和服务器需求共同推高半导体硬件价值量。"
        },
        {
          "title": "国产替代并跑",
          "body": "设备、材料、晶圆制造和设计公司从“有没有”进入“好不好、能否批量导入”的新阶段。"
        },
        {
          "title": "政策资金共振",
          "body": "大基金三期和十五五产业地位升级，推动设备材料国产化向纵深推进。"
        }
      ],
      "watchlist": [
        {
          "segment": "全球周期与WSTS预测",
          "signals": [
            "WSTS预测修订",
            "存储芯片价格",
            "AI芯片资本开支",
            "库存周期"
          ],
          "companies": "兆易创新、澜起科技、中芯国际、中微公司"
        },
        {
          "segment": "芯片设计",
          "signals": [
            "EDA国产化",
            "模拟芯片毛利率",
            "MCU/NOR价格",
            "AI芯片订单"
          ],
          "companies": "华大九天、圣邦股份、兆易创新、海光信息、寒武纪"
        },
        {
          "segment": "晶圆制造",
          "signals": [
            "成熟制程产能利用率",
            "12英寸扩产",
            "特色工艺毛利率",
            "出口管制影响"
          ],
          "companies": "中芯国际、华虹公司、华润微"
        },
        {
          "segment": "封测与先进封装",
          "signals": [
            "CoWoS产能",
            "HBM封装订单",
            "2.5D/3D封装扩产",
            "产能利用率"
          ],
          "companies": "长电科技、通富微电"
        },
        {
          "segment": "设备与材料",
          "signals": [
            "刻蚀/薄膜沉积订单",
            "光刻/量检测国产化",
            "硅片产能",
            "光刻胶与电子特气认证"
          ],
          "companies": "中微公司、北方华创、拓荆科技、沪硅产业、安集科技、华特气体、中船特气"
        }
      ],
      "updates": [
        {
          "date": "2026-06-04",
          "segment": "全产业链",
          "signal": "建立半导体产业链总览基准框架",
          "impact": "将芯片设计、晶圆制造、封装测试、设备、材料五大环节统一归档，并与半导体设备、存储、光刻机、光刻胶等子系列形成母篇导航关系。",
          "confidence": "基准框架",
          "sourceTitle": "半导体产业链全景解析原始稿",
          "sourceUrl": "./content/raw/semiconductor-industry-chain-original.md",
          "notes": "初始版本来自用户提供文章，尚未做逐项外部核验。后续重点跟踪WSTS预测、存储涨价、国产设备导入、先进封装订单和材料认证进展。"
        },
        {
          "date": "2026-06-04",
          "segment": "周期判断",
          "signal": "待核验：WSTS将2026年全球半导体市场规模上修至1.5112万亿美元",
          "impact": "若预测兑现，存储、AI芯片、先进封装和设备材料将成为全行业景气度最强的主线。",
          "confidence": "待核验",
          "sourceTitle": "用户提供的半导体产业链文章",
          "sourceUrl": "./content/raw/semiconductor-industry-chain-original.md",
          "notes": "需要后续补充WSTS原始报告、预测口径、按产品类别拆分和同比基数验证。"
        }
      ]
    },
    {
      "id": "semiconductor-equipment",
      "title": "半导体设备产业链",
      "shortTitle": "半导体设备",
      "theme": "AI算力与存储扩产推高晶圆厂资本开支，国产替代由整机向射频电源、精密零部件、光学和量检测等深水区延伸。",
      "status": "已建档",
      "trackingProfile": {
        "title": "半导体设备专属动态追踪",
        "summary": "从晶圆厂资本开支出发，重点跟踪上游精密零部件与射频/真空系统、前道核心设备、后道封测设备，以及收入增长能否转化为现金流和利润。",
        "metrics": [
          {
            "name": "晶圆厂CAPEX",
            "why": "晶圆厂与存储厂资本开支决定设备订单总水位。",
            "signals": [
              "AI芯片扩产",
              "DRAM/HBM扩产",
              "3D NAND扩产",
              "设备招标"
            ]
          },
          {
            "name": "核心零部件国产化",
            "why": "射频电源、真空系统、光学和精密工艺件决定整机国产化深度。",
            "signals": [
              "7nm制程验证",
              "射频电源交付",
              "真空腔体订单",
              "光刻光学订单"
            ]
          },
          {
            "name": "前道核心设备",
            "why": "刻蚀、沉积、清洗、涂胶显影、CMP和量检测承接晶圆厂扩产。",
            "signals": [
              "刻蚀订单",
              "PECVD/ALD",
              "清洗与CMP",
              "量检测验证"
            ]
          },
          {
            "name": "后道封测设备",
            "why": "先进封装扩产带动激光划片、直写光刻、测试机和分选机放量。",
            "signals": [
              "先进封装",
              "激光划片",
              "直写光刻",
              "测试机与分选机"
            ]
          },
          {
            "name": "利润兑现质量",
            "why": "高研发与扩产投入可能造成收入、利润和现金流分化。",
            "signals": [
              "毛利率",
              "扣非净利",
              "经营现金流",
              "存货与应收"
            ]
          }
        ]
      },
      "article": "./content/raw/semiconductor-equipment-industry-chain-original.md",
      "cover": "./cover-image/semiconductor-equipment-industry-chain/semiconductor-equipment-industry-chain-cover.png",
      "diagram": "./diagram/semiconductor-equipment-industry-chain/semiconductor-equipment-industry-chain-map@2x.png",
      "diagramSvg": "./diagram/semiconductor-equipment-industry-chain/semiconductor-equipment-industry-chain-map.svg",
      "updateFile": "./content/updates/semiconductor-equipment-chain-updates.json",
      "chain": [
        {
          "id": "components",
          "name": "上游：核心零部件与支撑设备",
          "role": "决定设备精度、洁净度、稳定性与国产化深度",
          "segments": [
            {
              "name": "精密工艺与结构零部件",
              "companies": "富创精密、先锋精科、华亚智能",
              "logic": "腔体、内衬、加热器、匀气盘与结构件随国产设备放量，并向先进制程验证延伸。"
            },
            {
              "name": "射频电源与真空系统",
              "companies": "恒运昌、新莱应材",
              "logic": "射频电源是真空等离子体工艺核心，高洁净管路和真空系统决定设备稳定性。"
            },
            {
              "name": "晶体生长设备",
              "companies": "晶升股份",
              "logic": "单晶硅与碳化硅扩产拉动单晶炉、衬底加工和外延设备需求。"
            },
            {
              "name": "光学系统",
              "companies": "茂莱光学、福晶科技",
              "logic": "光刻与量测设备依赖高端物镜、光学模组和非线性光学晶体。"
            },
            {
              "name": "电子特气",
              "companies": "中船特气、华特气体",
              "logic": "光刻气和高纯电子气体认证壁垒高，是晶圆制造的关键耗材。"
            }
          ]
        },
        {
          "id": "front-end",
          "name": "前道：晶圆制造设备",
          "role": "覆盖晶圆制造关键工艺，是资本开支与国产替代的主战场",
          "segments": [
            {
              "name": "刻蚀与平台型设备",
              "companies": "中微公司、北方华创",
              "logic": "刻蚀和平台型设备是国产替代确定性最高、价值量最大的核心赛道。"
            },
            {
              "name": "薄膜沉积",
              "companies": "拓荆科技、微导纳米",
              "logic": "PECVD与ALD受先进逻辑、DRAM/HBM和3D NAND堆叠持续拉动。"
            },
            {
              "name": "清洗设备",
              "companies": "盛美上海",
              "logic": "清洗贯穿晶圆制造全流程，国产化率领先并向电镀、炉管和涂胶显影平台化扩张。"
            },
            {
              "name": "涂胶显影",
              "companies": "芯源微",
              "logic": "与光刻机联机配套，客户验证与国产光刻产线建设决定放量节奏。"
            },
            {
              "name": "CMP抛光",
              "companies": "华海清科",
              "logic": "先进逻辑和存储芯片层数提升增加平坦化工序与CMP设备需求。"
            },
            {
              "name": "量检测",
              "companies": "中科飞测",
              "logic": "量检测直接影响良率，国产化率仍低，是高价值替代难点。"
            }
          ]
        },
        {
          "id": "back-end",
          "name": "后道：封装与测试设备",
          "role": "先进封装与测试扩产带来更快的订单和利润弹性",
          "segments": [
            {
              "name": "激光划片与封装设备",
              "companies": "大族激光",
              "logic": "激光划片、隐切与打标设备受益先进封装产能建设。"
            },
            {
              "name": "直写光刻",
              "companies": "芯碁微装",
              "logic": "晶圆级封装与高密度互连推动直写光刻设备重复订单。"
            },
            {
              "name": "半导体测试机",
              "companies": "华峰测控",
              "logic": "模拟、数模混合与功率器件扩产提升测试机国产替代需求。"
            },
            {
              "name": "测试/分选/探针",
              "companies": "长川科技",
              "logic": "测试机、分选机和探针台共同受益封测景气与国产替代。"
            }
          ]
        },
        {
          "id": "downstream",
          "name": "下游：晶圆厂、存储与封测",
          "role": "AI芯片、存储和先进封装需求通过资本开支向设备端传导",
          "segments": [
            {
              "name": "晶圆代工",
              "companies": "中芯国际、华虹半导体",
              "logic": "先进逻辑与成熟制程扩产共同支撑前道设备采购和国产验证。"
            },
            {
              "name": "存储IDM",
              "companies": "长江存储、长鑫科技",
              "logic": "DRAM/HBM与3D NAND扩产对刻蚀、沉积、清洗和量检测拉动最直接。"
            },
            {
              "name": "封装与测试",
              "companies": "长电科技、通富微电、华天科技",
              "logic": "TSV、Chiplet等先进封装路线打开后道设备第二增长曲线。"
            }
          ]
        }
      ],
      "logic": [
        {
          "title": "AI与存储扩产",
          "body": "GPU、HBM、ASIC及3D NAND需求推高晶圆厂和封测厂资本开支。"
        },
        {
          "title": "国产替代进入深水区",
          "body": "国产化从整机有无转向先进制程性能、批量稳定性和核心零部件自主化。"
        },
        {
          "title": "零部件价值重估",
          "body": "射频电源、真空系统、光学、量检测与精密工艺件成为下一阶段验证重点。"
        },
        {
          "title": "后道利润弹性",
          "body": "先进封装扩产推动激光、直写光刻、测试与分选设备更快兑现利润。"
        }
      ],
      "watchlist": [
        {
          "segment": "精密零部件与射频/真空系统",
          "signals": [
            "头部设备商导入",
            "7nm及以下制程验证",
            "射频电源批量交付",
            "扩产与毛利率"
          ],
          "companies": "富创精密、先锋精科、恒运昌、华亚智能、新莱应材"
        },
        {
          "segment": "晶体生长与光学系统",
          "signals": [
            "8英寸碳化硅设备订单",
            "12英寸单晶硅炉验证",
            "光刻供应链订单",
            "半导体在手订单占比"
          ],
          "companies": "晶升股份、茂莱光学、福晶科技"
        },
        {
          "segment": "电子特气",
          "signals": [
            "光刻气认证",
            "头部晶圆厂覆盖率",
            "产能利用率",
            "产品价格"
          ],
          "companies": "中船特气、华特气体"
        },
        {
          "segment": "刻蚀与平台型设备",
          "signals": [
            "先进制程验证",
            "DRAM份额",
            "订单与收入",
            "净利率"
          ],
          "companies": "中微公司、北方华创"
        },
        {
          "segment": "薄膜沉积",
          "signals": [
            "PECVD份额",
            "ALD订单",
            "3D NAND堆叠层数",
            "存储扩产"
          ],
          "companies": "拓荆科技、微导纳米"
        },
        {
          "segment": "清洗/涂胶显影/CMP/量检测",
          "signals": [
            "客户验证",
            "国产化率",
            "平台化扩张",
            "研发投入与利润兑现"
          ],
          "companies": "盛美上海、芯源微、华海清科、中科飞测"
        },
        {
          "segment": "后道封装测试设备",
          "signals": [
            "先进封装订单",
            "测试设备景气度",
            "订单增速",
            "经营现金流"
          ],
          "companies": "大族激光、芯碁微装、华峰测控、长川科技"
        },
        {
          "segment": "下游资本开支与盈利质量",
          "signals": [
            "晶圆厂CAPEX",
            "DRAM/HBM/3D NAND扩产",
            "设备招标节奏",
            "设备商存货应收与现金流"
          ],
          "companies": "中芯国际、华虹半导体、长江存储、长鑫科技、长电科技"
        }
      ],
      "updates": [
        {
          "date": "2026-06-12",
          "segment": "全产业链",
          "signal": "根据新版完整原稿重建产业链框架",
          "impact": "上游新增先锋精科、恒运昌、华亚智能及晶升股份，前道设备按工艺拆分，后道封装测试独立成层，形成从核心零部件到下游资本开支的完整追踪结构。",
          "confidence": "基准框架",
          "sourceTitle": "半导体设备产业链深度解析",
          "sourceUrl": "./content/raw/semiconductor-equipment-industry-chain-original.md",
          "notes": "本次属于结构性升级；原稿中的最新财务和市场数据仍需结合公告与定期报告持续核验。"
        },
        {
          "date": "2026-06-12",
          "segment": "核心零部件",
          "signal": "国产替代观察从机械件扩展至射频电源、真空系统、光学与晶体生长设备",
          "impact": "设备国产化的判断不再只看整机份额，还需追踪关键零部件批量导入、先进制程验证和客户集中度变化。",
          "confidence": "重点观察",
          "sourceTitle": "半导体设备产业链深度解析",
          "sourceUrl": "./content/raw/semiconductor-equipment-industry-chain-original.md",
          "notes": "重点关注富创精密、先锋精科、恒运昌、新莱应材、晶升股份、茂莱光学和福晶科技。"
        },
        {
          "date": "2026-06-04",
          "segment": "设备板块",
          "signal": "将存储与AI扩产作为设备景气的首条动态观察线",
          "impact": "持续追踪设备龙头订单、存储厂扩产、先进封装资本开支及后道测试设备盈利弹性是否共振。",
          "confidence": "待核验",
          "sourceTitle": "半导体设备产业链深度解析",
          "sourceUrl": "./content/raw/semiconductor-equipment-industry-chain-original.md",
          "notes": "建议用公司公告、季报、机构调研和设备招标信息逐项核验。"
        }
      ]
    },
    {
      "id": "storage",
      "title": "存储产业链",
      "shortTitle": "存储",
      "theme": "AI算力需求推动HBM、DRAM、NAND进入超级周期，国产存储双巨头IPO与模组厂业绩爆发共同驱动产业链重估。",
      "status": "已建档",
      "trackingProfile": {
        "title": "存储专属动态追踪",
        "summary": "重点看HBM/DRAM/NAND价格、长鑫长存IPO与扩产、模组厂库存红利、封测和设备材料订单，以及利基存储毛利率修复。",
        "metrics": [
          {
            "name": "价格周期",
            "why": "存储行业利润弹性首先来自DRAM、NAND、HBM和企业级SSD价格变化。",
            "signals": [
              "DRAM现货价",
              "NAND合约价",
              "HBM均价",
              "企业级SSD报价"
            ]
          },
          {
            "name": "国产双巨头",
            "why": "长鑫科技和长江存储IPO、扩产和HBM/NAND技术进展决定国产链估值重估强度。",
            "signals": [
              "IPO进度",
              "月产能",
              "HBM产线",
              "3D NAND份额"
            ]
          },
          {
            "name": "模组库存红利",
            "why": "江波龙、佰维存储、德明利等业绩高度依赖低价库存与终端涨价传导。",
            "signals": [
              "存货",
              "毛利率",
              "经营现金流",
              "长期供给协议"
            ]
          },
          {
            "name": "封测与先进封装",
            "why": "HBM和高端存储需要先进封装与测试能力，封测厂资本开支和订单是关键变量。",
            "signals": [
              "HBM封装",
              "2.5D/3D封装",
              "产能利用率",
              "测试设备订单"
            ]
          },
          {
            "name": "设备材料订单",
            "why": "长鑫、长存扩产会向刻蚀、沉积、量检测、CMP、洁净室和HBM材料传导。",
            "signals": [
              "PECVD/ALD",
              "刻蚀订单",
              "CMP抛光垫",
              "洁净室工程"
            ]
          }
        ]
      },
      "article": "./content/raw/storage-industry-chain-original.md",
      "cover": "./cover-image/storage-industry-chain/storage-industry-chain-cover.png",
      "diagram": "./diagram/storage-industry-chain/storage-industry-chain-map@2x.png",
      "diagramSvg": "./diagram/storage-industry-chain/storage-industry-chain-map.svg",
      "updateFile": "./content/updates/storage-chain-updates.json",
      "chain": [
        {
          "id": "upstream",
          "title": "上游：设备材料",
          "role": "长鑫、长存扩产向设备、材料和洁净室工程传导",
          "items": [
            {
              "name": "前道设备",
              "detail": "薄膜沉积、刻蚀、平台型设备直接受益存储扩产。",
              "companies": "拓荆科技、中微公司、北方华创"
            },
            {
              "name": "清洗与量检测",
              "detail": "涂胶显影、化学清洗、良率监控需求随产能爬坡提升。",
              "companies": "芯源微、中科飞测"
            },
            {
              "name": "材料与洁净室",
              "detail": "CMP抛光垫、洁净室工程、HBM/HBF材料构成扩产前置和材料国产化主线。",
              "companies": "鼎龙股份、柏诚股份、圣泉集团"
            }
          ]
        },
        {
          "id": "midstream",
          "title": "中游：设计 / 制造 / 封测",
          "role": "国产存储双巨头、A股设计龙头和先进封测共同构成核心赛道",
          "items": [
            {
              "name": "存储设计",
              "detail": "NOR、车规DRAM、DDR5接口、EEPROM和CXL配套芯片受益AI与DDR5升级。",
              "companies": "兆易创新、北京君正、澜起科技、聚辰股份"
            },
            {
              "name": "晶圆制造",
              "detail": "长鑫科技和长江存储IPO及扩产，是国产存储产业链重估核心催化。",
              "companies": "长鑫科技、长江存储、中芯国际"
            },
            {
              "name": "封测与先进封装",
              "detail": "HBM、2.5D/3D封装、测试分选机需求提升。",
              "companies": "长电科技、通富微电、甬矽电子、华天科技、金海通"
            }
          ]
        },
        {
          "id": "downstream",
          "title": "下游：模组与终端",
          "role": "模组厂直接承接涨价和库存红利，业绩弹性最大",
          "items": [
            {
              "name": "存储模组",
              "detail": "企业级SSD、端侧AI存储和消费存储涨价带来高弹性。",
              "companies": "江波龙、佰维存储、德明利、香农芯创"
            },
            {
              "name": "利基存储",
              "detail": "NOR、EEPROM、SLC NAND等受益海外产能退出和毛利率修复。",
              "companies": "普冉股份、东芯股份、恒烁股份"
            },
            {
              "name": "终端应用",
              "detail": "AI服务器、PC、手机、汽车电子共同拉动HBM、DDR5和企业级SSD需求。",
              "companies": "AI服务器、PC、手机、汽车电子"
            }
          ]
        }
      ],
      "logic": [
        {
          "title": "AI算力爆发",
          "body": "AI服务器推高HBM、DDR5和企业级SSD需求，存储价值占比显著提升。"
        },
        {
          "title": "供需紧张延续",
          "body": "海外大厂转向HBM导致传统DRAM/NAND供给收缩，涨价趋势是核心利润变量。"
        },
        {
          "title": "国产双巨头IPO",
          "body": "长鑫科技和长江存储上市与扩产节奏，将持续催化国产存储全产业链重估。"
        },
        {
          "title": "模组厂高弹性",
          "body": "低价库存、终端涨价和长期供给协议使模组厂成为短期业绩弹性最大的环节。"
        }
      ],
      "watchlist": [
        {
          "segment": "价格周期",
          "signals": [
            "DRAM/NAND现货价",
            "合约价",
            "HBM价格",
            "企业级SSD报价",
            "模组毛利率"
          ],
          "companies": "兆易创新、江波龙、佰维存储、德明利、香农芯创"
        },
        {
          "segment": "国产存储制造",
          "signals": [
            "IPO进度",
            "月产能",
            "HBM产线",
            "NAND份额",
            "资本开支"
          ],
          "companies": "长鑫科技、长江存储、中芯国际"
        },
        {
          "segment": "存储设计",
          "signals": [
            "产品出货",
            "毛利率",
            "长鑫关联采购",
            "DDR5渗透率",
            "HBM接口认证"
          ],
          "companies": "兆易创新、北京君正、澜起科技、聚辰股份"
        },
        {
          "segment": "封测与先进封装",
          "signals": [
            "先进封装资本开支",
            "产能利用率",
            "HBM订单",
            "测试设备订单"
          ],
          "companies": "长电科技、通富微电、甬矽电子、华天科技、金海通"
        },
        {
          "segment": "设备材料",
          "signals": [
            "长鑫/长存订单",
            "反应腔出货",
            "洁净室项目",
            "CMP抛光垫导入",
            "HBM材料验证"
          ],
          "companies": "拓荆科技、中微公司、北方华创、芯源微、中科飞测、柏诚股份、鼎龙股份、圣泉集团"
        },
        {
          "segment": "利基存储",
          "signals": [
            "营收环比",
            "毛利率环比",
            "海外产能退出",
            "端侧AI需求"
          ],
          "companies": "普冉股份、东芯股份、恒烁股份"
        }
      ],
      "updates": [
        {
          "date": "2026-06-04",
          "segment": "全产业链",
          "signal": "建立存储产业链基准逻辑",
          "impact": "以AI算力、HBM稀缺、DRAM/NAND涨价、国产存储双巨头IPO和模组厂业绩弹性为主线，追踪从设备材料到模组成品的量价变化。",
          "confidence": "基准框架",
          "sourceTitle": "存储产业链深度解析原始稿",
          "sourceUrl": "./content/raw/storage-industry-chain-original.md",
          "notes": "初始版本来自用户提供文章，尚未做逐项外部核验。"
        },
        {
          "date": "2026-06-04",
          "segment": "模组与价格",
          "signal": "将模组厂库存红利与DRAM/NAND涨价作为首要观察变量",
          "impact": "江波龙、佰维存储、德明利、香农芯创等业绩弹性高度依赖涨价持续性，后续需重点跟踪报价、库存、毛利率和经营现金流。",
          "confidence": "待核验",
          "sourceTitle": "存储产业链深度解析原始稿",
          "sourceUrl": "./content/raw/storage-industry-chain-original.md",
          "notes": "建议后续结合现货价、合约价、公司季报和机构调研持续更新。"
        }
      ]
    },
    {
      "id": "optical-module",
      "title": "光模块产业链",
      "shortTitle": "光模块",
      "theme": "AI算力推动800G/1.6T光模块放量，CPO硅光交换机量产和光芯片紧缺共同重构光互联价值链。",
      "status": "已建档",
      "trackingProfile": {
        "title": "光模块专属动态追踪",
        "summary": "重点看800G/1.6T订单、CPO硅光量产、InP/EML/CW光芯片供需、薄膜铌酸锂与光引擎，以及光纤光缆涨价和多芯光缆商用。",
        "metrics": [
          {
            "name": "高速光模块订单",
            "why": "800G/1.6T放量直接决定中际旭创、新易盛等龙头业绩兑现。",
            "signals": [
              "800G订单",
              "1.6T订单",
              "海外云厂CAPEX",
              "产能扩张"
            ]
          },
          {
            "name": "光芯片瓶颈",
            "why": "EML、CW光源、PLC/AWG和InP衬底是高速模块供给瓶颈。",
            "signals": [
              "EML批量交付",
              "CW光源导入",
              "InP供需缺口",
              "良率"
            ]
          },
          {
            "name": "CPO与硅光",
            "why": "CPO交换机量产将价值链向光引擎、硅光、调制器和高精密器件重构。",
            "signals": [
              "Spectrum-X",
              "CPO量产",
              "硅光占比",
              "光引擎出货"
            ]
          },
          {
            "name": "薄膜铌酸锂",
            "why": "TFLN在1.6T/CPO时代具备高速低功耗优势，是下一代核心增量。",
            "signals": [
              "TFLN订单",
              "96G/130GBaud",
              "客户验证",
              "现金流"
            ]
          },
          {
            "name": "光纤光缆组网",
            "why": "多芯光缆商用和光纤涨价代表智算网络底层连接升级。",
            "signals": [
              "三波段多芯光缆",
              "光纤价格",
              "交换机订单",
              "智算网络项目"
            ]
          }
        ]
      },
      "article": "./content/raw/optical-module-industry-chain-original.md",
      "cover": "./cover-image/optical-module-industry-chain/optical-module-industry-chain-cover.png",
      "diagram": "./diagram/optical-module-industry-chain/optical-module-industry-chain-map@2x.png",
      "diagramSvg": "./diagram/optical-module-industry-chain/optical-module-industry-chain-map.svg",
      "updateFile": "./content/updates/optical-module-chain-updates.json",
      "chain": [
        {
          "id": "upstream",
          "title": "上游：光芯片与材料",
          "role": "技术壁垒最高，决定高速光模块性能和产能瓶颈",
          "items": [
            {
              "name": "光芯片",
              "detail": "EML、CW光源、PLC/AWG等高速光芯片直接受益800G/1.6T放量。",
              "companies": "源杰科技、长光华芯、仕佳光子"
            },
            {
              "name": "薄膜铌酸锂与光学晶体",
              "detail": "TFLN调制器和光学晶体受益CPO、硅光和高速低功耗架构。",
              "companies": "光库科技、福晶科技"
            },
            {
              "name": "衬底与陶瓷封装",
              "detail": "InP衬底、陶瓷外壳、陶瓷基板和插芯构成光芯片与模块封装基础。",
              "companies": "云南锗业、中瓷电子、三环集团、国瓷材料"
            },
            {
              "name": "光纤预制棒与光缆",
              "detail": "光棒-光纤-光缆一体化承接智算网络干线升级和光纤涨价。",
              "companies": "长飞光纤、亨通光电"
            }
          ]
        },
        {
          "id": "midstream",
          "title": "中游：光器件与光模块",
          "role": "800G/1.6T高速产品放量，是产业链业绩兑现最直接环节",
          "items": [
            {
              "name": "光器件与光引擎",
              "detail": "无源光器件、光引擎、OCS/CPO零部件随高速模块同步高增。",
              "companies": "天孚通信、腾景科技"
            },
            {
              "name": "高速光模块",
              "detail": "800G、1.6T、LPO、硅光方案承接全球AI数据中心互联需求。",
              "companies": "中际旭创、新易盛、剑桥科技、华工科技"
            }
          ]
        },
        {
          "id": "downstream",
          "title": "下游：智算组网",
          "role": "从光模块升级走向CPO交换机和全光互联网络重构",
          "items": [
            {
              "name": "CPO硅光交换机",
              "detail": "英伟达Spectrum-X硅光交换机量产，推动光电一体封装商用化。",
              "companies": "Spectrum-X、Vera Rubin生态"
            },
            {
              "name": "光纤光缆网络",
              "detail": "三波段多芯光缆和光纤涨价体现底层连接需求升级。",
              "companies": "长飞光纤、亨通光电"
            },
            {
              "name": "交换机与云厂",
              "detail": "云厂AI资本开支和交换机系统集成决定CPO与光互联落地速度。",
              "companies": "中兴通讯、Meta、Oracle、微软、谷歌"
            }
          ]
        }
      ],
      "logic": [
        {
          "title": "光进铜退",
          "body": "AI集群规模扩大后，铜互连逼近物理极限，全光互联成为算力释放的必要路径。"
        },
        {
          "title": "高速模块放量",
          "body": "800G/1.6T产品放量拉动光芯片、光器件、陶瓷封装和模块制造共振。"
        },
        {
          "title": "CPO价值重构",
          "body": "CPO硅光交换机落地后，价值链向光引擎、硅光设计、TFLN调制器和高精度器件迁移。"
        },
        {
          "title": "底层网络升级",
          "body": "多芯光缆商用和光纤涨价说明智算网络的连接底座正在升级。"
        }
      ],
      "watchlist": [
        {
          "segment": "高速光模块",
          "signals": [
            "800G/1.6T订单",
            "海外云厂资本开支",
            "硅光占比",
            "产能扩张",
            "毛利率"
          ],
          "companies": "中际旭创、新易盛、剑桥科技、华工科技"
        },
        {
          "segment": "光芯片",
          "signals": [
            "客户验证",
            "批量交付",
            "CW光源导入",
            "良率",
            "扣非利润"
          ],
          "companies": "源杰科技、长光华芯、仕佳光子"
        },
        {
          "segment": "CPO与薄膜铌酸锂",
          "signals": [
            "CPO量产节奏",
            "TFLN订单",
            "光引擎出货",
            "OCS零部件订单",
            "现金流"
          ],
          "companies": "光库科技、天孚通信、腾景科技、福晶科技"
        },
        {
          "segment": "上游材料与封装",
          "signals": [
            "InP供需缺口",
            "订单排期",
            "陶瓷封装产能",
            "业务收入占比",
            "估值匹配度"
          ],
          "companies": "云南锗业、中瓷电子、三环集团、国瓷材料、福晶科技"
        },
        {
          "segment": "光纤光缆与组网",
          "signals": [
            "光纤价格",
            "多芯光缆商用",
            "交换机订单",
            "运营商/云厂组网项目"
          ],
          "companies": "长飞光纤、亨通光电、中兴通讯"
        },
        {
          "segment": "风险与拥挤度",
          "signals": [
            "资金集中度",
            "PE/利润匹配",
            "传统模块替代风险",
            "海外AI CAPEX"
          ],
          "companies": "中际旭创、新易盛、云南锗业、长光华芯"
        }
      ],
      "updates": [
        {
          "date": "2026-06-04",
          "segment": "全产业链",
          "signal": "建立光模块产业链基准逻辑",
          "impact": "以AI算力、800G/1.6T放量、CPO硅光交换机量产、上游光芯片紧缺和光纤光缆升级为主线，追踪光互联从容量升级到网络架构重构。",
          "confidence": "基准框架",
          "sourceTitle": "光模块产业链深度解析原始稿",
          "sourceUrl": "./content/raw/optical-module-industry-chain-original.md",
          "notes": "初始版本来自用户提供文章，尚未做逐项外部核验。"
        },
        {
          "date": "2026-06-04",
          "segment": "CPO与光纤光缆",
          "signal": "将英伟达CPO量产与三波段多芯光缆商用作为首要动态观察线",
          "impact": "若CPO交换机和多芯光缆进入持续商用，价值链将从可插拔模块向光引擎、硅光、调制器、光器件和底层光纤网络重构。",
          "confidence": "待核验",
          "sourceTitle": "光模块产业链深度解析原始稿",
          "sourceUrl": "./content/raw/optical-module-industry-chain-original.md",
          "notes": "建议后续用英伟达、云厂CAPEX、LightCounting、公司公告和调研纪要持续核验。"
        }
      ]
    },
    {
      "id": "ai-compute-infrastructure",
      "title": "AI算力基础设施产业链",
      "shortTitle": "AI算力",
      "theme": "从AI芯片、HBM、PCB、光模块，到服务器、交换机、液冷、HVDC和智算中心，形成AI基础设施总图谱。",
      "status": "已建档",
      "trackingProfile": {
        "title": "AI算力基础设施专属动态追踪",
        "summary": "重点看云厂CAPEX、国产AI芯片出货、AI服务器订单、800G/1.6T光互联、液冷/HVDC渗透率和智算中心上架率。",
        "metrics": [
          {
            "name": "云厂CAPEX",
            "why": "北美云厂、国内互联网和运营商资本开支决定算力链总需求。",
            "signals": [
              "微软/亚马逊/谷歌/Meta CAPEX",
              "国内互联网CAPEX",
              "运营商招标",
              "东数西算"
            ]
          },
          {
            "name": "AI芯片与国产替代",
            "why": "AI芯片供给决定服务器交付能力，国产替代决定国内智算中心弹性。",
            "signals": [
              "海光DCU",
              "寒武纪",
              "昇腾生态",
              "CoWoS产能"
            ]
          },
          {
            "name": "AI服务器交付",
            "why": "服务器整机是芯片能力系统化的核心载体。",
            "signals": [
              "HGX/DGX订单",
              "国产智算招标",
              "ODM收入",
              "交付周期"
            ]
          },
          {
            "name": "光互联升级",
            "why": "800G/1.6T、CPO和光模块是GPU集群高速互联的瓶颈。",
            "signals": [
              "1.6T订单",
              "CPO量产",
              "光芯片供需",
              "交换机端口"
            ]
          },
          {
            "name": "液冷与HVDC",
            "why": "高功率机柜推动散热和供电系统从配套环节变成核心瓶颈。",
            "signals": [
              "液冷订单",
              "HVDC渗透率",
              "单机柜功率",
              "头部客户导入"
            ]
          },
          {
            "name": "智算中心变现",
            "why": "AIDC上架率、算力租赁价格和云服务需求决定算力资产回报。",
            "signals": [
              "上架率",
              "算力租赁价格",
              "运营商云",
              "模型推理需求"
            ]
          }
        ]
      },
      "article": "./content/raw/ai-compute-infrastructure-industry-chain-original.md",
      "cover": "./cover-image/ai-compute-infrastructure-industry-chain/ai-compute-infrastructure-industry-chain-cover.png",
      "diagram": "./diagram/ai-compute-infrastructure-industry-chain/ai-compute-infrastructure-industry-chain-map@2x.png",
      "diagramSvg": "./diagram/ai-compute-infrastructure-industry-chain/ai-compute-infrastructure-industry-chain-map.svg",
      "updateFile": "./content/updates/ai-compute-infrastructure-chain-updates.json",
      "chain": [
        {
          "id": "upstream",
          "title": "上游：基础硬件",
          "role": "决定算力、带宽、存储和高速互联上限",
          "items": [
            {
              "name": "AI芯片",
              "detail": "GPU、DCU、ASIC和国产AI芯片是算力基础设施的心脏。",
              "companies": "海光信息、寒武纪、景嘉微"
            },
            {
              "name": "存储与接口",
              "detail": "HBM、DDR5、内存接口和利基存储决定AI服务器带宽与容量。",
              "companies": "兆易创新、澜起科技、北京君正"
            },
            {
              "name": "PCB与光芯片",
              "detail": "AI服务器PCB和光芯片分别支撑板级互联和集群光互联。",
              "companies": "胜宏科技、沪电股份、源杰科技、光库科技"
            }
          ]
        },
        {
          "id": "midstream",
          "title": "中游：算力平台与网络",
          "role": "将芯片能力转化为可部署的系统能力",
          "items": [
            {
              "name": "AI服务器",
              "detail": "全球ODM和国产服务器承接GPU平台与智算中心订单。",
              "companies": "工业富联、浪潮信息、中科曙光、华勤技术"
            },
            {
              "name": "光模块与交换机",
              "detail": "800G/1.6T光模块、CPO交换机和数据中心交换机是算力网络血管。",
              "companies": "中际旭创、新易盛、天孚通信、中兴通讯、锐捷网络"
            },
            {
              "name": "液冷散热",
              "detail": "高功率GPU机柜推动液冷从可选配置变为刚需。",
              "companies": "英维克、高澜股份"
            },
            {
              "name": "供电系统",
              "detail": "HVDC、UPS和电能质量系统支撑30-100kW高功率机柜。",
              "companies": "中恒电气、科华数据、科士达、盛弘股份"
            }
          ]
        },
        {
          "id": "downstream",
          "title": "下游：智算与应用",
          "role": "算力最终承载、分发和变现出口",
          "items": [
            {
              "name": "智算中心",
              "detail": "IDC向AIDC升级，算力租赁和上架率成为资产回报核心。",
              "companies": "光环新网、奥飞数据、数据港"
            },
            {
              "name": "云与算力网络",
              "detail": "运营商云和算力网络把分散算力连接成全国一体化基础设施。",
              "companies": "中国电信、中国移动、优刻得"
            },
            {
              "name": "AI模型与应用",
              "detail": "训练、推理、Agent和行业应用持续消耗算力并形成闭环。",
              "companies": "训练、推理、Agent、行业应用"
            }
          ]
        }
      ],
      "logic": [
        {
          "title": "CAPEX军备竞赛",
          "body": "全球科技巨头和国内运营商持续上修AI基础设施资本开支，构成总需求源。"
        },
        {
          "title": "芯片与国产替代",
          "body": "英伟达平台迭代和国产AI芯片放量并行，推动海外和国内算力链同时活跃。"
        },
        {
          "title": "光互联与电力瓶颈",
          "body": "800G/1.6T、CPO、液冷和HVDC成为AI数据中心从能用到高效运行的关键约束。"
        },
        {
          "title": "智算中心变现",
          "body": "最终需要通过AIDC上架率、算力租赁、云服务和AI应用需求验证资产回报。"
        }
      ],
      "watchlist": [
        {
          "segment": "AI芯片与国产替代",
          "signals": [
            "国产AI芯片出货",
            "智算中心导入",
            "制程供应链",
            "CoWoS产能",
            "客户验证"
          ],
          "companies": "海光信息、寒武纪、景嘉微"
        },
        {
          "segment": "存储与高速接口",
          "signals": [
            "HBM/DDR5供需",
            "接口芯片出货",
            "毛利率",
            "长鑫合作",
            "服务器内存容量"
          ],
          "companies": "兆易创新、澜起科技、北京君正"
        },
        {
          "segment": "AI服务器与交换机",
          "signals": [
            "服务器订单",
            "海外云厂CAPEX",
            "国内智算招标",
            "800G端口",
            "交付周期"
          ],
          "companies": "工业富联、浪潮信息、中科曙光、华勤技术、中兴通讯、锐捷网络、紫光股份"
        },
        {
          "segment": "光互联",
          "signals": [
            "1.6T订单",
            "CPO量产",
            "光芯片供需",
            "硅光占比",
            "模块毛利率"
          ],
          "companies": "中际旭创、新易盛、天孚通信、源杰科技、光库科技"
        },
        {
          "segment": "散热与供电",
          "signals": [
            "液冷订单",
            "单机柜功率",
            "HVDC渗透率",
            "头部客户导入",
            "宁德时代协同"
          ],
          "companies": "英维克、高澜股份、中恒电气、科华数据、科士达、盛弘股份"
        },
        {
          "segment": "智算中心与云服务",
          "signals": [
            "国家枢纽节点",
            "算力租赁价格",
            "运营商CAPEX",
            "机柜上架率",
            "云厂需求"
          ],
          "companies": "光环新网、奥飞数据、数据港、中国电信、中国移动、优刻得"
        }
      ],
      "updates": [
        {
          "date": "2026-06-04",
          "segment": "全产业链",
          "signal": "建立AI算力基础设施产业链基准逻辑",
          "impact": "将AI芯片、存储、PCB、光模块、AI服务器、交换机、液冷、HVDC和智算中心纳入同一个总览框架，作为已有子产业链的上层总图谱。",
          "confidence": "基准框架",
          "sourceTitle": "AI算力基础设施产业链深度解析原始稿",
          "sourceUrl": "./content/raw/ai-compute-infrastructure-industry-chain-original.md",
          "notes": "初始版本来自用户提供文章，尚未做逐项外部核验。"
        },
        {
          "date": "2026-06-04",
          "segment": "资本开支",
          "signal": "将云厂CAPEX、国产智算招标、液冷/HVDC渗透率作为首要动态观察线",
          "impact": "AI算力基础设施是多个已建档产业链的总需求源，后续每条动态应判断其向PCB、存储、光模块、半导体设备等子链的传导方向。",
          "confidence": "待核验",
          "sourceTitle": "AI算力基础设施产业链深度解析原始稿",
          "sourceUrl": "./content/raw/ai-compute-infrastructure-industry-chain-original.md",
          "notes": "建议后续用云厂财报CAPEX、运营商招标、数据中心上架率和公司订单口径持续核验。"
        }
      ]
    },
    {
      "id": "power-infrastructure",
      "title": "电力基础设施产业链",
      "shortTitle": "电力基建",
      "theme": "十五五电网投资、全球电网升级和AI数据中心用电井喷共振，电力基础设施从能源配套升级为算电协同枢纽。",
      "status": "已建档",
      "trackingProfile": {
        "title": "电力基础设施专属动态追踪",
        "summary": "重点看国网/南网招标、特高压开工、配网投资占比、算电协同项目、AI数据中心供电订单、电力设备出口和原材料成本。",
        "metrics": [
          {
            "name": "特高压与主网",
            "why": "主网和特高压是十五五电网投资最具确定性的设备需求源。",
            "signals": [
              "特高压开工",
              "换流阀份额",
              "GIS订单",
              "柔直项目"
            ]
          },
          {
            "name": "智能配电网",
            "why": "新能源、充电桩和数据中心接入抬高配网承载力与智能化要求。",
            "signals": [
              "配网投资占比",
              "智能开关",
              "配电自动化",
              "故障研判"
            ]
          },
          {
            "name": "数字电网与算电协同",
            "why": "电力光网、算力调度和电网数字化把电网升级为算力基础设施的一部分。",
            "signals": [
              "国网数字化招标",
              "南网数字化",
              "算力调度",
              "电力通信网络"
            ]
          },
          {
            "name": "AI数据中心供电",
            "why": "高功率机柜推动HVDC、UPS、干式变压器和电能质量设备成为新瓶颈。",
            "signals": [
              "HVDC订单",
              "单机柜功率",
              "AIDC电源收入",
              "宁德时代协同"
            ]
          },
          {
            "name": "电力设备出海",
            "why": "全球电网改造带动中国变压器、开关、电表、电缆出口。",
            "signals": [
              "海外订单",
              "出口金额",
              "欧洲框架合同",
              "贸易政策"
            ]
          },
          {
            "name": "成本与盈利",
            "why": "铜、铝、硅钢和中标价格决定设备厂商利润质量。",
            "signals": [
              "铜铝价格",
              "硅钢价格",
              "中标价格",
              "毛利率"
            ]
          }
        ]
      },
      "article": "./content/raw/power-infrastructure-industry-chain-original.md",
      "cover": "./cover-image/power-infrastructure-industry-chain/power-infrastructure-industry-chain-cover.png",
      "diagram": "./diagram/power-infrastructure-industry-chain/power-infrastructure-industry-chain-map@2x.png",
      "diagramSvg": "./diagram/power-infrastructure-industry-chain/power-infrastructure-industry-chain-map.svg",
      "updateFile": "./content/updates/power-infrastructure-chain-updates.json",
      "chain": [
        {
          "id": "upstream",
          "title": "上游：设备制造",
          "role": "输变电、配电和电力电子设备构成电网硬件底座",
          "items": [
            {
              "name": "特高压与主网设备",
              "detail": "换流阀、GIS、变压器、电抗器等设备直接受益主网与特高压投资。",
              "companies": "国电南瑞、平高电气、中国西电、特变电工"
            },
            {
              "name": "直流与柔性直流",
              "detail": "柔直换流阀、控制保护和一次设备在跨区输电中价值量高。",
              "companies": "许继电气、思源电气、东方电气、四方股份"
            },
            {
              "name": "数据中心供电硬件",
              "detail": "HVDC、UPS、干式变压器和电能质量设备受益AI高功率机柜。",
              "companies": "中恒电气、科华数据、科士达、金盘科技、盛弘股份"
            }
          ]
        },
        {
          "id": "midstream",
          "title": "中游：电网建设运营",
          "role": "国网、南网主导的特高压、配网、数字电网与出海景气周期",
          "items": [
            {
              "name": "特高压与主网建设",
              "detail": "十五五电网投资和跨区输电工程带动主网设备需求。",
              "companies": "国家电网、南方电网"
            },
            {
              "name": "智能配电网",
              "detail": "配网自动化、智能开关和故障研判提升末端可靠性。",
              "companies": "东方电子、国电南自、宏力达"
            },
            {
              "name": "数字电网与算电协同",
              "detail": "电网数字化、电力光网和算力调度支撑算电融合。",
              "companies": "国网信通、南网数字"
            },
            {
              "name": "电力设备出海",
              "detail": "全球电网改造推动中国高压设备、智能电表和电缆出口。",
              "companies": "思源电气、三星医疗、海兴电力、林洋能源、汉缆股份"
            }
          ]
        },
        {
          "id": "downstream",
          "title": "下游：终端用电",
          "role": "电力需求从传统负荷扩展到AI算力、新能源和充电场景",
          "items": [
            {
              "name": "AI数据中心",
              "detail": "高功率机柜要求高可靠供电、HVDC、UPS和电能质量保障。",
              "companies": "AIDC、超算中心、互联网数据中心"
            },
            {
              "name": "新能源与充电",
              "detail": "新能源并网、储能、充电桩抬高配网承载力和调节需求。",
              "companies": "新能源电站、储能、充电运营商"
            },
            {
              "name": "工业与居民负荷",
              "detail": "传统负荷持续要求配网可靠性、电能质量和数字化运维。",
              "companies": "工业、5G通信、居民用电"
            }
          ]
        }
      ],
      "logic": [
        {
          "title": "电网投资确定性",
          "body": "十五五电网投资超5万亿元，主网、特高压和配网共同构成五年期设备需求。"
        },
        {
          "title": "全球电网升级",
          "body": "欧洲、美国和一带一路市场电网改造，为国内设备企业打开出口空间。"
        },
        {
          "title": "算电协同",
          "body": "AI数据中心用电快速增长，使HVDC、数字电网、电力光网和供电系统成为算力底座。"
        },
        {
          "title": "盈利质量分化",
          "body": "中标价格、铜铝硅钢成本和海外订单结构决定设备企业毛利率。"
        }
      ],
      "watchlist": [
        {
          "segment": "特高压与主网",
          "signals": [
            "特高压开工",
            "国网招标",
            "换流阀份额",
            "GIS订单",
            "柔直项目",
            "变压器出口"
          ],
          "companies": "国电南瑞、平高电气、中国西电、特变电工、许继电气、思源电气、东方电气、四方股份"
        },
        {
          "segment": "智能配电网",
          "signals": [
            "配网投资占比",
            "智能开关订单",
            "配网自动化项目",
            "毛利率",
            "中标价格"
          ],
          "companies": "东方电子、国电南自、宏力达"
        },
        {
          "segment": "数字电网与算电协同",
          "signals": [
            "政策文件",
            "国网/南网数字化招标",
            "算力调度项目",
            "电力通信网络建设"
          ],
          "companies": "国网信通、南网数字"
        },
        {
          "segment": "AI数据中心供电",
          "signals": [
            "HVDC订单",
            "单机柜功率",
            "数据中心电源收入占比",
            "宁德时代协同",
            "液冷/供电联动"
          ],
          "companies": "中恒电气、科华数据、科士达、金盘科技、盛弘股份、四方股份"
        },
        {
          "segment": "电力设备出海",
          "signals": [
            "海外订单",
            "出口金额",
            "欧洲框架合同",
            "汇率",
            "贸易政策"
          ],
          "companies": "思源电气、三星医疗、海兴电力、林洋能源、汉缆股份、中国西电"
        },
        {
          "segment": "成本与盈利",
          "signals": [
            "铜铝价格",
            "硅钢价格",
            "招标价格",
            "毛利率",
            "经营现金流"
          ],
          "companies": "特变电工、中国西电、平高电气、思源电气、中恒电气"
        }
      ],
      "updates": [
        {
          "date": "2026-06-04",
          "segment": "全产业链",
          "signal": "建立电力基础设施产业链基准逻辑",
          "impact": "以十五五电网投资、特高压主网、智能配网、算电协同、AI数据中心供电和电力设备出海为主线，追踪电力基础设施从能源配套向算力底座升级。",
          "confidence": "基准框架",
          "sourceTitle": "电力基础设施产业链深度解析原始稿",
          "sourceUrl": "./content/raw/power-infrastructure-industry-chain-original.md",
          "notes": "初始版本来自用户提供文章，尚未做逐项外部核验。"
        },
        {
          "date": "2026-06-04",
          "segment": "算电协同",
          "signal": "将AI数据中心供电与电网投资作为首要动态观察线",
          "impact": "电力基础设施与AI算力基础设施开始强耦合，HVDC、干式变压器、数字电网和电力光网等环节需要和AI数据中心建设节奏联动追踪。",
          "confidence": "待核验",
          "sourceTitle": "电力基础设施产业链深度解析原始稿",
          "sourceUrl": "./content/raw/power-infrastructure-industry-chain-original.md",
          "notes": "建议后续用国网/南网招标、AIDC供电订单、出口数据和公司季报持续更新。"
        }
      ]
    },
    {
      "id": "ai-energy-supply",
      "title": "AI算力能源供给侧产业链",
      "shortTitle": "AI能源供给",
      "theme": "AI数据中心缺电倒逼自建发电，燃气轮机、柴发、天然气内燃机、SOFC与HRSG进入供不应求周期。",
      "status": "已建档",
      "trackingProfile": {
        "title": "AI能源供给侧专属动态追踪",
        "summary": "重点看北美AIDC自建发电项目、燃机/柴发交期、燃气轮机订单、精密铸件产能、SOFC批量落地和HRSG越南产线。",
        "metrics": [
          {
            "name": "自建发电需求",
            "why": "电网扩容慢于数据中心建设，自建发电是核心需求源。",
            "signals": [
              "北美AIDC项目",
              "电网限电",
              "主用电源",
              "备用电源"
            ]
          },
          {
            "name": "燃气轮机订单",
            "why": "燃气轮机是主用电源弹性最大路线，全球产能缺口明显。",
            "signals": [
              "杰瑞订单",
              "北美本地化",
              "燃机交期",
              "产能缺口"
            ]
          },
          {
            "name": "柴发与内燃机",
            "why": "柴发是备用电源底座，天然气内燃机成为灵活主电源。",
            "signals": [
              "大缸径发动机",
              "数据中心销量",
              "交付周期",
              "天然气机组"
            ]
          },
          {
            "name": "SOFC放量",
            "why": "SOFC原生直流输出和高效率特征契合AIDC供电升级。",
            "signals": [
              "SOFC产能",
              "CE认证",
              "效率指标",
              "批量订单"
            ]
          },
          {
            "name": "上游零部件",
            "why": "精密铸件、高温合金叶片和HRSG决定整机交付能力。",
            "signals": [
              "联德墨西哥",
              "叶片订单",
              "HRSG交付",
              "高温合金产能"
            ]
          },
          {
            "name": "出海与本地化",
            "why": "北美需求与海外长交期打开中国供应链出海窗口。",
            "signals": [
              "海外订单",
              "越南基地",
              "墨西哥工厂",
              "客户验证"
            ]
          }
        ]
      },
      "article": "./content/raw/ai-energy-supply-industry-chain-original.md",
      "cover": "./cover-image/ai-energy-supply-industry-chain/ai-energy-supply-industry-chain-cover.png",
      "diagram": "./diagram/ai-energy-supply-industry-chain/ai-energy-supply-industry-chain-map@2x.png",
      "diagramSvg": "./diagram/ai-energy-supply-industry-chain/ai-energy-supply-industry-chain-map.svg",
      "updateFile": "./content/updates/ai-energy-supply-chain-updates.json",
      "chain": [
        {
          "id": "upstream",
          "title": "上游：核心零部件",
          "role": "发电设备的卖铲人，验证周期长、客户黏性强",
          "items": [
            {
              "name": "精密铸件",
              "detail": "内燃机缸体、齿轮箱体、飞轮壳体和燃机零部件受益北美AIDC订单。",
              "companies": "联德股份"
            },
            {
              "name": "高温合金与热端部件",
              "detail": "透平叶片、高温合金和燃机热端部件是燃气轮机扩产瓶颈。",
              "companies": "应流股份、万泽股份、豪迈科技、冰轮环境"
            },
            {
              "name": "余热锅炉与配套",
              "detail": "HRSG和联合循环设备提升燃气轮机系统效率。",
              "companies": "西子洁能、博盈特焊"
            }
          ]
        },
        {
          "id": "midstream",
          "title": "中游：发电设备整机",
          "role": "柴油发电、燃气轮机、天然气内燃机和SOFC多路线并行",
          "items": [
            {
              "name": "柴油发电机",
              "detail": "备用电源核心，10秒满载能力决定数据中心应急可靠性。",
              "companies": "潍柴动力、科泰电源、泰豪科技、中国动力"
            },
            {
              "name": "燃气轮机",
              "detail": "主用电源弹性最大，北美数据中心订单和产能缺口是核心变量。",
              "companies": "杰瑞股份、东方电气、上海电气"
            },
            {
              "name": "天然气内燃机",
              "detail": "启动快、调度灵活，成为燃气轮机产能不足下的主用替代方案。",
              "companies": "潍柴动力、联德股份供应链"
            },
            {
              "name": "SOFC",
              "detail": "高效率、热电联产、原生直流输出，适合AIDC供电架构升级。",
              "companies": "潍柴动力"
            }
          ]
        },
        {
          "id": "downstream",
          "title": "下游：AIDC自建发电",
          "role": "数据中心从接电走向自发电，交钥匙电力方案成为新增量",
          "items": [
            {
              "name": "备用电源",
              "detail": "电网故障快速切换，成熟可靠性优先。",
              "companies": "柴油发电机组"
            },
            {
              "name": "主用电源",
              "detail": "7×24小时持续供电，缓解电网扩容周期滞后。",
              "companies": "燃气轮机、天然气内燃机、SOFC"
            },
            {
              "name": "系统集成与余热回收",
              "detail": "HRSG、联合循环和海外基地支撑北美AI电力基建交付。",
              "companies": "博盈特焊、西子洁能"
            }
          ]
        }
      ],
      "logic": [
        {
          "title": "缺电倒逼自建发电",
          "body": "电网扩容周期长于数据中心建设周期，AIDC从被动接电转向主动建设电源。"
        },
        {
          "title": "发电设备供不应求",
          "body": "燃气轮机、柴发和大缸径发动机交期拉长，零部件和整机订单同步上行。"
        },
        {
          "title": "中国供应链出海",
          "body": "国内交付周期更短，墨西哥、越南等本地化基地帮助承接北美需求。"
        },
        {
          "title": "SOFC新增量",
          "body": "SOFC高效率和直流输出契合数据中心供电架构，行业进入从1到10阶段。"
        }
      ],
      "watchlist": [
        {
          "segment": "精密铸件",
          "signals": [
            "北美客户订单",
            "墨西哥投产",
            "德清二期扩产",
            "制冷+发电收入占比",
            "毛利率"
          ],
          "companies": "联德股份"
        },
        {
          "segment": "高温合金与燃机零部件",
          "signals": [
            "燃机龙头配套",
            "叶片订单",
            "高温合金产能",
            "余热锅炉交付",
            "海外客户验证"
          ],
          "companies": "应流股份、万泽股份、豪迈科技、冰轮环境、西子洁能"
        },
        {
          "segment": "燃气轮机发电",
          "signals": [
            "燃机订单金额",
            "北美本地化产能",
            "交付周期",
            "燃机产能缺口",
            "客户数量"
          ],
          "companies": "杰瑞股份、东方电气、上海电气"
        },
        {
          "segment": "柴发与天然气内燃机",
          "signals": [
            "数据中心发动机销量",
            "交付周期",
            "海外替代",
            "备用电源订单",
            "天然气机组需求"
          ],
          "companies": "潍柴动力、科泰电源、泰豪科技、中国动力"
        },
        {
          "segment": "SOFC",
          "signals": [
            "SOFC产能落地",
            "CE认证",
            "效率指标",
            "数据中心订单",
            "从1到10放量"
          ],
          "companies": "潍柴动力"
        },
        {
          "segment": "系统集成与HRSG",
          "signals": [
            "越南产线",
            "HRSG交付",
            "北美订单",
            "毛利率",
            "垃圾焚烧收入占比下降"
          ],
          "companies": "博盈特焊、西子洁能"
        }
      ],
      "updates": [
        {
          "date": "2026-06-04",
          "segment": "全产业链",
          "signal": "建立AI算力能源供给侧产业链基准逻辑",
          "impact": "以AI数据中心缺电、自建发电、燃气轮机产能缺口、柴发交付差、SOFC放量和HRSG需求为主线，追踪算力基础设施从用电端延伸到能源供给侧。",
          "confidence": "基准框架",
          "sourceTitle": "AI算力基础设施能源供给侧产业链深度解析原始稿",
          "sourceUrl": "./content/raw/ai-energy-supply-industry-chain-original.md",
          "notes": "初始版本来自用户提供文章，尚未做逐项外部核验。"
        },
        {
          "date": "2026-06-04",
          "segment": "自建发电",
          "signal": "将北美AIDC自建发电与燃机/柴发交付周期作为首要观察线",
          "impact": "若电网扩容继续慢于数据中心建设，燃气轮机、天然气内燃机、柴发、SOFC和HRSG需求会从备用逻辑升级为主电源逻辑。",
          "confidence": "待核验",
          "sourceTitle": "AI算力基础设施能源供给侧产业链深度解析原始稿",
          "sourceUrl": "./content/raw/ai-energy-supply-industry-chain-original.md",
          "notes": "建议后续跟踪云厂能源项目、燃机订单、发动机交期、SOFC批量订单和公司出海产能。"
        }
      ]
    },
    {
      "id": "consumer-electronics",
      "title": "消费电子产业链",
      "shortTitle": "消费电子",
      "theme": "AI端侧渗透、折叠屏iPhone预期、AI眼镜放量和以旧换新补贴共振，消费电子从出货量逻辑转向单机价值量逻辑。",
      "status": "已建档",
      "trackingProfile": {
        "title": "消费电子专属动态追踪",
        "summary": "重点看AI手机/AIPC、折叠屏iPhone、AI眼镜、以旧换新补贴，以及存储、散热、电池、FPC、光学、声学和结构件单机价值量提升。",
        "metrics": [
          {
            "name": "AI终端渗透",
            "why": "AI手机、AIPC和AI眼镜决定端侧AI硬件升级节奏。",
            "signals": [
              "AI手机渗透率",
              "AIPC销量占比",
              "AI眼镜出货",
              "端侧存储容量"
            ]
          },
          {
            "name": "折叠屏创新",
            "why": "折叠屏iPhone若落地，会重构柔性OLED、UTG、铰链和FPC供应链。",
            "signals": [
              "苹果折叠屏进度",
              "柔性OLED订单",
              "FPC用量",
              "华为份额"
            ]
          },
          {
            "name": "核心芯片",
            "why": "AI终端升级需要更高存储容量、CIS、PMIC和射频前端。",
            "signals": [
              "存储价格",
              "CIS出货",
              "快充渗透",
              "射频国产替代"
            ]
          },
          {
            "name": "结构与散热",
            "why": "高功耗和新形态终端推动玻璃盖板、功能件、散热和电池升级。",
            "signals": [
              "结构件订单",
              "VC均热板",
              "电池容量",
              "硅负极"
            ]
          },
          {
            "name": "声学与可穿戴",
            "why": "AI语音和AI眼镜让声学、光学、微型结构件成为交互入口。",
            "signals": [
              "AI眼镜出货",
              "TWS复苏",
              "声学模组",
              "AR/VR订单"
            ]
          },
          {
            "name": "政策与需求",
            "why": "以旧换新和618等节点决定短期换机弹性，也要警惕需求透支。",
            "signals": [
              "补贴力度",
              "订单同比",
              "库存水位",
              "ODM出货"
            ]
          }
        ]
      },
      "article": "./content/raw/consumer-electronics-industry-chain-original.md",
      "cover": "./cover-image/consumer-electronics-industry-chain/consumer-electronics-industry-chain-cover.png",
      "diagram": "./diagram/consumer-electronics-industry-chain/consumer-electronics-industry-chain-map@2x.png",
      "diagramSvg": "./diagram/consumer-electronics-industry-chain/consumer-electronics-industry-chain-map.svg",
      "updateFile": "./content/updates/consumer-electronics-chain-updates.json",
      "chain": [
        {
          "id": "upstream",
          "title": "上游：核心元器件",
          "role": "AI端侧升级带动单机价值量提升，国产替代空间最大",
          "items": [
            {
              "name": "芯片与存储",
              "detail": "AI终端容量升级带动NOR/DRAM、CIS、PMIC和射频前端需求。",
              "companies": "兆易创新、韦尔股份、南芯科技、卓胜微"
            },
            {
              "name": "显示与光学",
              "detail": "折叠屏、柔性OLED、多摄和AI视觉推动显示与光学升级。",
              "companies": "京东方A、维信诺、水晶光电、思特威"
            },
            {
              "name": "结构件/散热/电池",
              "detail": "高功耗和新形态终端推动玻璃盖板、功能件、散热和电池升级。",
              "companies": "蓝思科技、领益智造、飞荣达、欣旺达"
            },
            {
              "name": "声学与PCB/FPC",
              "detail": "AI语音、TWS、AI眼镜和折叠屏提升声学与FPC价值量。",
              "companies": "歌尔股份、鹏鼎控股、东山精密、顺络电子"
            }
          ]
        },
        {
          "id": "midstream",
          "title": "中游：模组与方案集成",
          "role": "零部件向整机功能转化的工程枢纽",
          "items": [
            {
              "name": "摄像头/显示/声学模组",
              "detail": "多摄、折叠屏显示和AI语音交互推动模组价值量提升。",
              "companies": "欧菲光、舜宇光学、歌尔股份、瑞声科技"
            },
            {
              "name": "ODM/EMS整机制造",
              "detail": "品牌外包提升头部ODM集中度，AIPC和AI手机带来高阶化。",
              "companies": "华勤技术、龙旗科技、闻泰科技、光弘科技"
            }
          ]
        },
        {
          "id": "downstream",
          "title": "下游：终端与新物种",
          "role": "品牌生态决定换机和创新节奏",
          "items": [
            {
              "name": "AI手机与折叠屏",
              "detail": "苹果折叠屏、华为鸿蒙和AI旗舰机决定供应链催化强度。",
              "companies": "苹果、华为、小米、荣耀"
            },
            {
              "name": "AIPC与平板",
              "detail": "高算力笔记本和高规格存储配置提升BOM价值。",
              "companies": "AIPC、平板电脑"
            },
            {
              "name": "AI眼镜与可穿戴",
              "detail": "下一代交互入口，声学、光学、结构件和电池方案受益。",
              "companies": "歌尔股份、安克创新、瑞声科技"
            }
          ]
        }
      ],
      "logic": [
        {
          "title": "AI端侧落地",
          "body": "生成式AI从云端下沉到终端，驱动存储、散热、电池、PCB、光学和声学全面升级。"
        },
        {
          "title": "形态创新",
          "body": "折叠屏iPhone和AI眼镜带动柔性显示、FPC、铰链、光学声学和结构件新需求。"
        },
        {
          "title": "补贴托底",
          "body": "以旧换新缩短换机周期，短期托底终端需求，但后续需跟踪需求透支。"
        },
        {
          "title": "价值量重估",
          "body": "总量承压背景下，单机价值量提升比出货量更能解释产业链弹性。"
        }
      ],
      "watchlist": [
        {
          "segment": "AI终端",
          "signals": [
            "AI手机渗透率",
            "AIPC销量占比",
            "AI眼镜出货",
            "端侧存储容量",
            "终端ASP"
          ],
          "companies": "华勤技术、兆易创新、歌尔股份、蓝思科技"
        },
        {
          "segment": "折叠屏",
          "signals": [
            "苹果折叠屏进度",
            "柔性OLED订单",
            "FPC用量",
            "UTG/铰链供应链",
            "华为份额"
          ],
          "companies": "京东方A、深天马A、维信诺、鹏鼎控股、东山精密、蓝思科技"
        },
        {
          "segment": "存储与芯片",
          "signals": [
            "存储价格",
            "毛利率",
            "AI终端容量",
            "CIS出货",
            "快充渗透",
            "射频国产替代"
          ],
          "companies": "兆易创新、普冉股份、东芯股份、韦尔股份、南芯科技、卓胜微"
        },
        {
          "segment": "结构件/散热/电池",
          "signals": [
            "结构件订单",
            "散热方案升级",
            "电池容量",
            "硅负极渗透",
            "毛利率"
          ],
          "companies": "蓝思科技、领益智造、飞荣达、中石科技、欣旺达、德赛电池、珠海冠宇"
        },
        {
          "segment": "声学与可穿戴",
          "signals": [
            "AI眼镜出货",
            "TWS复苏",
            "声学模组价值量",
            "AR/VR订单",
            "语音交互"
          ],
          "companies": "歌尔股份、瑞声科技、安克创新"
        },
        {
          "segment": "政策与需求",
          "signals": [
            "补贴力度",
            "订单同比",
            "库存水位",
            "ODM出货",
            "需求透支"
          ],
          "companies": "小米集团、传音控股、华勤技术、龙旗科技"
        }
      ],
      "updates": [
        {
          "date": "2026-06-04",
          "segment": "全产业链",
          "signal": "建立消费电子产业链基准逻辑",
          "impact": "以AI端侧渗透、折叠屏iPhone预期、AI眼镜放量、以旧换新补贴和单机价值量提升为主线，追踪消费电子从总量修复转向结构升级。",
          "confidence": "基准框架",
          "sourceTitle": "消费电子产业链深度解析原始稿",
          "sourceUrl": "./content/raw/consumer-electronics-industry-chain-original.md",
          "notes": "初始版本来自用户提供文章，尚未做逐项外部核验。"
        },
        {
          "date": "2026-06-04",
          "segment": "终端升级",
          "signal": "将AI手机/AIPC、折叠屏iPhone和AI眼镜作为首要观察线",
          "impact": "消费电子需求的核心变量从出货量切换到单机价值量，存储、散热、电池、FPC、光学、声学和结构件需要联动追踪。",
          "confidence": "待核验",
          "sourceTitle": "消费电子产业链深度解析原始稿",
          "sourceUrl": "./content/raw/consumer-electronics-industry-chain-original.md",
          "notes": "建议后续结合IDC/Counterpoint、品牌发布会、618数据、公司季报和供应链调研更新。"
        }
      ]
    },
    {
      "id": "innovative-drug",
      "title": "创新药产业链",
      "shortTitle": "创新药",
      "theme": "中国创新药从数量积累走向价值兑现，BD出海、CXO复苏、盈利拐点和支付优化共同驱动。",
      "status": "已建档",
      "trackingProfile": {
        "title": "创新药专属动态追踪",
        "summary": "重点看BD出海质量、CXO订单能见度、创新药盈利拐点、ADC/双抗临床数据和医保商保支付环境。",
        "metrics": [
          {
            "name": "BD出海",
            "why": "License-out交易是中国创新药全球价值重估最直接信号，首付款和模式质量比总额更关键。",
            "signals": [
              "交易总额",
              "首付款",
              "里程碑",
              "共同开发商业化"
            ]
          },
          {
            "name": "CXO订单",
            "why": "CXO是创新药研发卖水人，在手订单和新分子业务决定业绩可见度。",
            "signals": [
              "在手订单",
              "新签订单",
              "TIDES收入",
              "产能利用率"
            ]
          },
          {
            "name": "盈利拐点",
            "why": "创新药从预期驱动走向业绩验证，产品收入、扣非利润和经营现金流是核心指标。",
            "signals": [
              "产品收入",
              "Non-GAAP盈利",
              "扣非利润",
              "经营现金流"
            ]
          },
          {
            "name": "技术平台",
            "why": "ADC、双抗、小核酸等前沿平台决定中国创新药是否从跟跑走向引领。",
            "signals": [
              "AACR/ASCO数据",
              "ADC项目",
              "双抗授权",
              "临床读数"
            ]
          },
          {
            "name": "支付环境",
            "why": "医保、商保和医院准入决定商业化最后一公里。",
            "signals": [
              "医保谈判",
              "商保目录",
              "DTP药房",
              "销售费用率"
            ]
          }
        ]
      },
      "article": "./content/raw/innovative-drug-industry-chain-original.md",
      "cover": "./cover-image/innovative-drug-industry-chain/innovative-drug-industry-chain-cover.png",
      "diagram": "./diagram/innovative-drug-industry-chain/innovative-drug-industry-chain-map@2x.png",
      "diagramSvg": "./diagram/innovative-drug-industry-chain/innovative-drug-industry-chain-map.svg",
      "updateFile": "./content/updates/innovative-drug-chain-updates.json",
      "chain": [
        {
          "id": "upstream",
          "title": "上游：CXO与研发服务",
          "role": "创新药研发链条的卖水人，订单能见度决定复苏强度。",
          "items": [
            {
              "name": "一体化CXO/CDMO",
              "detail": "药物发现、临床前、临床、工艺开发与商业化生产",
              "companies": "药明康德、凯莱英、泰格医药、康龙化成、昭衍新药"
            },
            {
              "name": "生命科学试剂耗材",
              "detail": "重组酶、抗体、重组蛋白、分子砌块、培养基",
              "companies": "诺唯赞、义翘神州、百普赛斯、皓元医药"
            },
            {
              "name": "药包材与设备",
              "detail": "高端包材、影像设备上游、临床试验配套",
              "companies": "华兰股份、奕瑞科技"
            }
          ]
        },
        {
          "id": "midstream",
          "title": "中游：创新药研发制造",
          "role": "价值创造核心，管线质量、临床数据和商业化能力决定估值。",
          "items": [
            {
              "name": "大型创新药企",
              "detail": "研发、临床、生产和商业化能力最完整",
              "companies": "恒瑞医药、百济神州"
            },
            {
              "name": "Biopharma",
              "detail": "ADC、双抗、自免、肿瘤等管线进入商业化兑现",
              "companies": "信达生物、荣昌生物、百利天恒、艾力斯、诺诚健华"
            },
            {
              "name": "前沿技术平台",
              "detail": "ADC、双抗/三抗、小核酸、细胞/基因治疗",
              "companies": "康方生物、科伦博泰、石药集团、三生国健"
            }
          ]
        },
        {
          "id": "downstream",
          "title": "下游：商业化与BD出海",
          "role": "价值兑现最后一公里，支付和全球授权决定利润回收速度。",
          "items": [
            {
              "name": "国内商业化",
              "detail": "医院、DTP药房、医保谈判、商保创新药目录",
              "companies": "恒瑞医药、百济神州、信达生物、荣昌生物"
            },
            {
              "name": "BD出海",
              "detail": "License-out、首付款、里程碑、销售分成、共同开发商业化",
              "companies": "恒瑞医药、信达生物、荣昌生物、科伦药业、康方生物"
            }
          ]
        }
      ],
      "logic": [
        {
          "title": "BD出海井喷",
          "body": "中国创新药交易额快速提升，全球药企对中国创新资产价值重估。"
        },
        {
          "title": "盈利拐点密集出现",
          "body": "多家Biopharma从亏损进入盈利或现金流改善，板块从预期走向验证。"
        },
        {
          "title": "CXO结构复苏",
          "body": "药明康德等龙头在手订单高企，新分子业务放量提升业绩能见度。"
        },
        {
          "title": "政策支付优化",
          "body": "生物医药被列为新兴支柱产业，医保+商保多层次支付体系改善商业化环境。"
        }
      ],
      "watchlist": [
        {
          "segment": "BD出海",
          "signals": [
            "License-out总额",
            "首付款规模",
            "里程碑付款",
            "Co-Development/Co-Commercialization模式"
          ],
          "companies": "恒瑞医药、信达生物、荣昌生物、科伦药业、康方生物、石药集团"
        },
        {
          "segment": "CXO",
          "signals": [
            "在手订单",
            "新签订单",
            "TIDES/多肽/寡核苷酸收入",
            "产能利用率",
            "地缘政治风险"
          ],
          "companies": "药明康德、凯莱英、泰格医药、康龙化成、昭衍新药"
        },
        {
          "segment": "创新药企",
          "signals": [
            "产品收入",
            "Non-GAAP盈利",
            "扣非盈利",
            "经营现金流",
            "核心产品放量"
          ],
          "companies": "恒瑞医药、百济神州、信达生物、荣昌生物、艾力斯、诺诚健华"
        },
        {
          "segment": "技术平台",
          "signals": [
            "ADC临床数据",
            "双抗/三抗进展",
            "小核酸",
            "细胞/基因治疗",
            "AACR/ASCO数据"
          ],
          "companies": "荣昌生物、百利天恒、康方生物、科伦博泰、三生国健"
        },
        {
          "segment": "支付与商业化",
          "signals": [
            "医保谈判",
            "商保创新药目录",
            "DTP药房",
            "医院准入",
            "销售费用率"
          ],
          "companies": "恒瑞医药、百济神州、信达生物、荣昌生物、君实生物"
        }
      ],
      "updates": [
        {
          "date": "2026-06-04",
          "segment": "全产业链",
          "signal": "建立创新药产业链基准框架",
          "impact": "以“上游CXO/试剂耗材 → 中游创新药企 → 下游商业化/BD出海/支付”为主线归档，后续动态围绕BD出海、CXO订单、盈利拐点、技术平台和支付环境更新。",
          "confidence": "基准框架",
          "sourceTitle": "创新药产业链深度解析原始稿",
          "sourceUrl": "./content/raw/innovative-drug-industry-chain-original.md",
          "notes": "初始版本来自用户提供文章，尚未做逐项外部核验。"
        },
        {
          "date": "2026-06-04",
          "segment": "BD出海",
          "signal": "待核验：2026年Q1中国创新药BD出海交易额突破600亿美元",
          "impact": "若全年延续，将推动中国创新药从研发投入期进入全球价值重估和商业兑现期，恒瑞、信达、荣昌、科伦等具备出海能力的药企优先受益。",
          "confidence": "待核验",
          "sourceTitle": "用户提供的创新药产业链文章",
          "sourceUrl": "./content/raw/innovative-drug-industry-chain-original.md",
          "notes": "后续需核验交易总额统计口径、首付款比例、是否包含未披露条款以及里程碑兑现概率。"
        }
      ]
    },
    {
      "id": "commercial-space",
      "title": "商业航天产业链",
      "shortTitle": "商业航天",
      "theme": "千帆星座组网、可复用火箭、SpaceX IPO和政策标准共振，卫星火箭制造进入产业化验证期。",
      "status": "已建档",
      "trackingProfile": {
        "title": "商业航天专属动态追踪",
        "summary": "重点看千帆/GW星座组网、可复用火箭试验、SpaceX IPO、ETF资金流、核心零部件订单和亏损企业风险。",
        "metrics": [
          {
            "name": "星座组网",
            "why": "低轨星座部署节奏决定卫星总装、载荷、电源和地面终端需求。",
            "signals": [
              "千帆发射批次",
              "在轨卫星数量",
              "GW星座",
              "年度发射次数"
            ]
          },
          {
            "name": "火箭与复用",
            "why": "可复用火箭决定发射成本拐点，是卫星互联网规模化经济性的关键。",
            "signals": [
              "长征十号乙",
              "民营火箭首飞",
              "回收试验",
              "发动机/结构件订单"
            ]
          },
          {
            "name": "材料与零部件",
            "why": "航天级材料、连接器、T/R组件、3D打印等是高壁垒卖铲环节。",
            "signals": [
              "碳纤维验证",
              "钛合金订单",
              "TR组件",
              "3D打印良率"
            ]
          },
          {
            "name": "地面设备与应用",
            "why": "卫星互联网商业化最终落在地面终端、运营收入和应用服务。",
            "signals": [
              "地面终端订单",
              "星地融合组网",
              "卫星运营收入",
              "导航/遥感应用"
            ]
          },
          {
            "name": "资本与风险",
            "why": "SpaceX IPO和ETF资金是短期催化，同时需警惕盈利能力和概念兑现。",
            "signals": [
              "SpaceX IPO",
              "ETF资金流",
              "标准体系",
              "亏损企业风险"
            ]
          }
        ]
      },
      "article": "./content/raw/commercial-space-industry-chain-original.md",
      "cover": "./cover-image/commercial-space-industry-chain/commercial-space-industry-chain-cover.png",
      "diagram": "./diagram/commercial-space-industry-chain/commercial-space-industry-chain-map@2x.png",
      "diagramSvg": "./diagram/commercial-space-industry-chain/commercial-space-industry-chain-map.svg",
      "updateFile": "./content/updates/commercial-space-chain-updates.json",
      "chain": [
        {
          "id": "upstream",
          "title": "上游：卫星与火箭制造",
          "role": "技术壁垒最高，订单放量最集中，是商业航天产业化验证的核心。",
          "items": [
            {
              "name": "卫星制造",
              "detail": "卫星总装、星载T/R组件、激光通信、电源系统、连接器",
              "companies": "中国卫星、航天电子、国博电子、信科移动、电科蓝天"
            },
            {
              "name": "火箭制造",
              "detail": "液体火箭发动机、结构件、高温合金、固体发动机喉衬、金属3D打印",
              "companies": "航天动力、超捷股份、西部材料、楚江新材、铂力特、航天电器"
            },
            {
              "name": "新材料与零部件",
              "detail": "碳纤维、钛合金、难熔金属、航天级连接器",
              "companies": "光威复材、宝钛股份、斯瑞新材"
            }
          ]
        },
        {
          "id": "midstream",
          "title": "中游：发射运营与地面设备",
          "role": "承接发射、测控、地面终端和星地融合组网，是制造端通向应用端的枢纽。",
          "items": [
            {
              "name": "发射服务",
              "detail": "固体/液体运载火箭、民营火箭、可复用火箭试验",
              "companies": "航天科工火箭、航天动力等"
            },
            {
              "name": "地面设备",
              "detail": "测运控、地面终端、星间激光链路、导航芯片",
              "companies": "中兴通讯、海格通信、北斗星通"
            },
            {
              "name": "风险样本",
              "detail": "遥感应用回款周期长，亏损企业需严格区分基本面和题材",
              "companies": "航天宏图"
            }
          ]
        },
        {
          "id": "downstream",
          "title": "下游：卫星应用与服务",
          "role": "远期弹性最大，最终体现为通信、导航、遥感、太空光伏和终端服务收入。",
          "items": [
            {
              "name": "卫星通信运营",
              "detail": "通信广播卫星运营、低轨卫星互联网服务",
              "companies": "中国卫通"
            },
            {
              "name": "地面终端与天线",
              "detail": "星链终端天线、相控阵天线、通信终端",
              "companies": "信维通信、盛路通信"
            },
            {
              "name": "新兴应用",
              "detail": "太空光伏、太空算力、星载超导材料、遥感数据",
              "companies": "迈为股份、西部超导、北斗星通"
            }
          ]
        }
      ],
      "logic": [
        {
          "title": "星座密集组网",
          "body": "千帆星座和GW星座进入部署期，直接拉动卫星制造与零部件订单。"
        },
        {
          "title": "可复用火箭",
          "body": "长征十号乙和民营火箭回收试验推动发射成本拐点预期。"
        },
        {
          "title": "SpaceX估值催化",
          "body": "SpaceX IPO可能重塑商业航天估值体系，并带动A股供应链情绪。"
        },
        {
          "title": "政策标准落地",
          "body": "商业航天标准体系发布，产业从鼓励发展转向标准化和工程化落地。"
        }
      ],
      "watchlist": [
        {
          "segment": "星座组网",
          "signals": [
            "千帆星座发射批次",
            "在轨卫星数量",
            "GW星座进展",
            "年度发射次数"
          ],
          "companies": "中国卫星、航天电子、国博电子、信科移动"
        },
        {
          "segment": "火箭与可复用技术",
          "signals": [
            "长征十号乙进展",
            "民营火箭首飞",
            "回收试验",
            "发动机/结构件订单"
          ],
          "companies": "航天动力、超捷股份、西部材料、楚江新材、铂力特、航天电器"
        },
        {
          "segment": "材料与零部件",
          "signals": [
            "碳纤维验证",
            "钛合金订单",
            "难熔金属配套",
            "3D打印良率"
          ],
          "companies": "光威复材、宝钛股份、斯瑞新材、铂力特"
        },
        {
          "segment": "地面设备与应用",
          "signals": [
            "地面终端订单",
            "星地融合组网",
            "卫星运营收入",
            "导航增强/遥感商业化"
          ],
          "companies": "中兴通讯、海格通信、中国卫通、北斗星通、信维通信"
        },
        {
          "segment": "资本与风险",
          "signals": [
            "SpaceX IPO",
            "航天ETF资金流",
            "商业航天标准体系",
            "亏损企业风险",
            "概念兑现"
          ],
          "companies": "信维通信、航天宏图、利欧股份、东方精工、壶化股份、金信诺"
        }
      ],
      "updates": [
        {
          "date": "2026-06-04",
          "segment": "全产业链",
          "signal": "建立商业航天产业链基准框架",
          "impact": "以“上游卫星/火箭研发制造 → 中游发射运营与地面设备 → 下游卫星应用与服务”为主线归档，后续动态围绕星座组网、可复用火箭、SpaceX IPO、ETF资金和核心零部件订单更新。",
          "confidence": "基准框架",
          "sourceTitle": "商业航天产业链深度解析原始稿",
          "sourceUrl": "./content/raw/commercial-space-industry-chain-original.md",
          "notes": "初始版本来自用户提供文章，尚未做逐项外部核验。"
        },
        {
          "date": "2026-06-04",
          "segment": "星座组网",
          "signal": "待核验：千帆星座第十批组网卫星成功发射，在轨卫星数量增至164颗",
          "impact": "若组网节奏持续推进，将直接拉动卫星总装、星载载荷、T/R组件、激光通信、电源系统和地面终端需求。",
          "confidence": "待核验",
          "sourceTitle": "用户提供的商业航天产业链文章",
          "sourceUrl": "./content/raw/commercial-space-industry-chain-original.md",
          "notes": "后续需要核验发射时间、卫星数量、承制单位、订单确认节奏和收入确认口径。"
        },
        {
          "date": "2026-06-04",
          "segment": "资本催化",
          "signal": "待核验：SpaceX拟6月12日登陆纳斯达克，目标估值1.77万亿美元",
          "impact": "若IPO落地，可能重塑全球商业航天估值体系，但也需警惕利好兑现后的板块资金退潮。",
          "confidence": "待核验",
          "sourceTitle": "用户提供的商业航天产业链文章",
          "sourceUrl": "./content/raw/commercial-space-industry-chain-original.md",
          "notes": "后续重点跟踪IPO真实文件、融资额、估值口径、上市进度以及A股SpaceX供应链订单兑现。"
        }
      ]
    },
    {
      "id": "energy-storage",
      "title": "储能产业链",
      "shortTitle": "储能",
      "theme": "AI算力基础设施配储刚需、全球储能迈入TWh时代，材料、电芯、PCS和系统集成迎来三重共振。",
      "status": "已建档",
      "trackingProfile": {
        "title": "储能专属动态追踪",
        "summary": "重点看AI数据中心配储、全球装机与招标、上游材料价格、电芯/PCS订单和系统集成盈利。",
        "metrics": [
          {
            "name": "AI数据中心配储",
            "why": "AI数据中心功率密度提升，储能从备用方案升级为算电协同核心组件。",
            "signals": [
              "AIDC ESS订单",
              "峰谷套利模型",
              "备用电源需求",
              "绿电消纳"
            ]
          },
          {
            "name": "全球装机与招标",
            "why": "装机和招标决定储能需求斜率，也是系统集成商收入兑现的先行指标。",
            "signals": [
              "GWh新增装机",
              "国内招标规模",
              "海外项目签约",
              "独立储能落地"
            ]
          },
          {
            "name": "上游材料价格",
            "why": "正极、电解液、隔膜、锂盐价格影响电芯成本和材料龙头盈利弹性。",
            "signals": [
              "碳酸锂",
              "六氟磷酸锂",
              "隔膜价格",
              "材料库存"
            ]
          },
          {
            "name": "中游电芯/PCS",
            "why": "电芯和PCS是价值最集中的环节，订单、出货和毛利率决定主线强度。",
            "signals": [
              "储能电芯出货",
              "PCS订单",
              "构网型产品",
              "毛利率"
            ]
          },
          {
            "name": "系统集成盈利",
            "why": "系统价格持续下行时，集成商盈利质量和海外占比是关键分化变量。",
            "signals": [
              "系统单价",
              "海外收入",
              "装机排名",
              "现金流"
            ]
          }
        ]
      },
      "article": "./content/raw/energy-storage-industry-chain-original.md",
      "cover": "./cover-image/energy-storage-industry-chain/energy-storage-industry-chain-cover.png",
      "diagram": "./diagram/energy-storage-industry-chain/energy-storage-industry-chain-map@2x.png",
      "diagramSvg": "./diagram/energy-storage-industry-chain/energy-storage-industry-chain-map.svg",
      "updateFile": "./content/updates/energy-storage-chain-updates.json",
      "chain": [
        {
          "id": "upstream",
          "title": "上游：锂电关键材料",
          "role": "决定储能电芯成本，是涨价周期和盈利修复的敏感环节",
          "items": [
            {
              "name": "正极材料",
              "detail": "磷酸铁锂、磷酸锰铁锂、固态电池正极",
              "companies": "德方纳米、厦钨新能、容百科技"
            },
            {
              "name": "负极材料",
              "detail": "天然石墨、人造石墨、高端负极",
              "companies": "贝特瑞、璞泰来"
            },
            {
              "name": "电解液/隔膜/铜箔",
              "detail": "六氟磷酸锂、湿法/干法隔膜、超薄锂电铜箔",
              "companies": "天赐材料、新宙邦、恩捷股份、星源材质、嘉元科技"
            },
            {
              "name": "锂电设备",
              "detail": "涂布、卷绕、化成分容等扩产设备",
              "companies": "先导智能、赢合科技"
            }
          ]
        },
        {
          "id": "midstream",
          "title": "中游：电芯与核心部件",
          "role": "价值最集中的环节，电芯、PCS、BMS/EMS共同决定系统效率和安全性",
          "items": [
            {
              "name": "储能电芯",
              "detail": "磷酸铁锂储能电芯、钠离子、固态电池路线",
              "companies": "宁德时代、比亚迪、亿纬锂能、国轩高科、中创新航"
            },
            {
              "name": "储能变流器 PCS",
              "detail": "交直流转换、构网型PCS、并网能力",
              "companies": "阳光电源、上能电气、固德威、锦浪科技、德业股份、首航新能"
            },
            {
              "name": "BMS/EMS/温控",
              "detail": "安全管控、能量调度、热管理",
              "companies": "协鑫能科、盛弘股份等"
            }
          ]
        },
        {
          "id": "downstream",
          "title": "下游：系统集成与应用",
          "role": "从设备走向场景，把储能价值放大到电网、工商业和AI数据中心",
          "items": [
            {
              "name": "系统集成",
              "detail": "电芯、PCS、BMS、EMS、温控标准化集成",
              "companies": "海博思创、阿特斯、科华数据、科士达、南都电源"
            },
            {
              "name": "AI数据中心配储",
              "detail": "备用供电、峰谷套利、负荷平抑、绿电消纳",
              "companies": "阳光电源、科士达、科华数据、海博思创"
            },
            {
              "name": "新能源配储/户储",
              "detail": "独立储能、源网侧、工商业和欧洲户储修复",
              "companies": "海博思创、固德威、锦浪科技、德业股份"
            }
          ]
        }
      ],
      "logic": [
        {
          "title": "AI配储刚需",
          "body": "AI数据中心功率密度提升，电网扩容周期滞后，储能成为备用供电、峰谷套利和负荷平抑的核心配置。"
        },
        {
          "title": "全球TWh时代",
          "body": "全球储能装机持续高增，新能源消纳、电网阻塞和海外需求共同打开长期空间。"
        },
        {
          "title": "材料涨价修复",
          "body": "锂盐、电解液、隔膜等价格回暖，供需改善推动材料龙头盈利弹性修复。"
        },
        {
          "title": "海外需求与价格压力",
          "body": "中国企业在海外储能市场份额领先，但系统单价下行要求更强的集成和成本控制能力。"
        }
      ],
      "watchlist": [
        {
          "segment": "AI数据中心配储",
          "signals": [
            "AIDC储能订单",
            "算电协同政策",
            "备用供电需求",
            "峰谷套利模型",
            "电网接入瓶颈"
          ],
          "companies": "阳光电源、科士达、科华数据、海博思创"
        },
        {
          "segment": "全球装机与招标",
          "signals": [
            "全球新增装机GWh",
            "国内招标规模",
            "独立储能签约",
            "海外户储需求",
            "Tier 1榜单"
          ],
          "companies": "宁德时代、比亚迪、亿纬锂能、海博思创、阿特斯"
        },
        {
          "segment": "上游材料价格",
          "signals": [
            "碳酸锂价格",
            "六氟磷酸锂价格",
            "隔膜价格",
            "正负极出货",
            "铜箔供需"
          ],
          "companies": "德方纳米、贝特瑞、天赐材料、恩捷股份、嘉元科技"
        },
        {
          "segment": "中游核心部件",
          "signals": [
            "储能电芯出货",
            "PCS订单",
            "BMS/EMS",
            "温控系统",
            "产能利用率"
          ],
          "companies": "宁德时代、亿纬锂能、阳光电源、上能电气、固德威"
        },
        {
          "segment": "系统集成与盈利",
          "signals": [
            "系统单价",
            "毛利率",
            "海外收入",
            "汇兑损益",
            "价格战"
          ],
          "companies": "海博思创、阳光电源、科士达、阿特斯、南都电源"
        }
      ],
      "updates": [
        {
          "date": "2026-06-04",
          "segment": "全产业链",
          "signal": "建立储能产业链基准框架",
          "impact": "以“上游材料 → 中游电芯/PCS/BMS → 下游系统集成与应用”为主线归档，后续动态围绕AI数据中心配储、全球装机、材料涨价、PCS订单和系统价格压力更新。",
          "confidence": "基准框架",
          "sourceTitle": "储能产业链深度解析原始稿",
          "sourceUrl": "./content/raw/energy-storage-industry-chain-original.md",
          "notes": "初始版本来自用户提供文章，尚未做逐项外部核验。"
        },
        {
          "date": "2026-06-04",
          "segment": "AI数据中心配储",
          "signal": "待核验：AI数据中心配储刚需持续释放，算电协同成为储能板块核心催化",
          "impact": "若AIDC储能订单持续落地，储能需求将从新能源消纳扩展到算力基础设施刚需，直接利好PCS、系统集成和数据中心电源相关企业。",
          "confidence": "待核验",
          "sourceTitle": "用户提供的储能产业链文章",
          "sourceUrl": "./content/raw/energy-storage-industry-chain-original.md",
          "notes": "后续重点核验AIDC项目实际配储比例、订单客户、并网方式、收益模型和收入确认节奏。"
        },
        {
          "date": "2026-06-04",
          "segment": "全球装机",
          "signal": "待核验：2026年全球储能新增装机预测约438GWh或459GWh",
          "impact": "若装机预测兑现，储能电芯、PCS、系统集成及材料端均有望维持高景气，但系统价格下行仍会压缩集成商利润。",
          "confidence": "待核验",
          "sourceTitle": "用户提供的储能产业链文章",
          "sourceUrl": "./content/raw/energy-storage-industry-chain-original.md",
          "notes": "需补充国金证券、BNEF等原始预测口径，区分功率GW与容量GWh，以及国内/海外/户储/大储结构。"
        }
      ]
    },
    {
      "id": "brain-computer-interface",
      "title": "脑机接口产业链",
      "shortTitle": "脑机接口",
      "theme": "政策催化、临床试验和Neuralink量产预期共振，脑机接口从实验室迈向商业化。",
      "status": "已建档",
      "trackingProfile": {
        "title": "脑机接口专属动态追踪",
        "summary": "重点看临床试验、注册审批、侵入式电极/芯片、康复商业化和强脑科技等一级市场进展。",
        "metrics": [
          {
            "name": "临床试验与注册审批",
            "why": "侵入式脑机接口能否从概念走向医疗器械，核心取决于临床安全性、有效性和注册进度。",
            "signals": [
              "多中心临床入组",
              "医疗器械注册证",
              "优先审批目录",
              "收费/医保口径"
            ]
          },
          {
            "name": "侵入式电极与材料",
            "why": "电极决定信号采集质量，是通道数、生物相容性和长期稳定性的核心瓶颈。",
            "signals": [
              "通道数",
              "柔性电极认证",
              "生物相容性",
              "长期稳定性"
            ]
          },
          {
            "name": "BCI专用芯片",
            "why": "专用芯片是国内短板，脑电采集和神经信号处理量产能力决定硬件国产化深度。",
            "signals": [
              "神经信号处理芯片",
              "脑电采集芯片",
              "量产出货",
              "功耗/通道密度"
            ]
          },
          {
            "name": "康复商业化",
            "why": "医疗康复是当前最确定的付费场景，主动康复设备可较早形成收入闭环。",
            "signals": [
              "主动康复设备",
              "医院导入",
              "订单/收入",
              "临床效果数据"
            ]
          },
          {
            "name": "一级市场与消费应用",
            "why": "非侵入式路线更易商业化，强脑科技IPO、融资和仿生手出货是重要外部信号。",
            "signals": [
              "强脑科技IPO",
              "融资金额",
              "仿生手销量",
              "消费级产品迭代"
            ]
          }
        ]
      },
      "article": "./content/raw/brain-computer-interface-industry-chain-original.md",
      "cover": "./cover-image/brain-computer-interface-industry-chain/brain-computer-interface-industry-chain-cover.png",
      "diagram": "./diagram/brain-computer-interface-industry-chain/brain-computer-interface-industry-chain-map@2x.png",
      "diagramSvg": "./diagram/brain-computer-interface-industry-chain/brain-computer-interface-industry-chain-map.svg",
      "updateFile": "./content/updates/brain-computer-interface-chain-updates.json",
      "chain": [
        {
          "id": "upstream",
          "title": "上游：核心硬件与材料",
          "role": "技术壁垒最高，决定脑信号采集质量、植入安全性和硬件国产化水平",
          "items": [
            {
              "name": "电极与传感器",
              "detail": "侵入式柔性电极、非侵入式干/湿电极、脑电柔性传感器",
              "companies": "康拓医疗、汉威科技、脑虎科技"
            },
            {
              "name": "专用芯片",
              "detail": "脑电采集芯片、神经信号处理芯片、多通道低功耗芯片",
              "companies": "英集芯、成都华微、高德红外相关公司"
            },
            {
              "name": "生物材料与精密制造",
              "detail": "LCP薄膜、硬脑膜补片、植入式连接器、安全性评价",
              "companies": "美好医疗、冠昊生物、迈普医学、谱尼测试、蓝思科技"
            }
          ]
        },
        {
          "id": "midstream",
          "title": "中游：系统集成与设备",
          "role": "把神经信号转化为可用产品，是临床设备和消费设备产业化中枢",
          "items": [
            {
              "name": "脑电采集与解码",
              "detail": "高通量采集、运动意图解码、闭环反馈",
              "companies": "博睿康、脑虎科技、诚益通"
            },
            {
              "name": "全植入/半侵入系统",
              "detail": "临床试验、注册证、医疗器械化路径",
              "companies": "博睿康、脑虎科技、阶梯医疗、三博脑科"
            },
            {
              "name": "非侵入式设备",
              "detail": "智能仿生手、仿生腿、睡眠调控、消费级设备",
              "companies": "强脑科技、蓝思科技、浙江东方、盈趣科技"
            }
          ]
        },
        {
          "id": "downstream",
          "title": "下游：商业化应用",
          "role": "医疗健康先行，消费互娱和工业特种作业打开远期弹性",
          "items": [
            {
              "name": "医疗康复",
              "detail": "脊髓损伤、脑卒中、帕金森、渐冻症、疼痛/盆底康复",
              "companies": "三博脑科、翔宇医疗、伟思医疗、创新医疗、爱朋医疗、麦澜德"
            },
            {
              "name": "消费与互娱",
              "detail": "仿生手、睡眠调控、游戏教育、智能家居意念控制",
              "companies": "强脑科技、科大讯飞、壹网壹创、岩山科技"
            },
            {
              "name": "工业与特种作业",
              "detail": "疲劳监测、高专注岗位安全预警、边缘智能应用",
              "companies": "诚益通、熵基科技、狄耐克"
            }
          ]
        }
      ],
      "logic": [
        {
          "title": "政策催化",
          "body": "脑机接口被列为未来产业，植入式医疗器械优先审批和地方收费依据推动商业闭环形成。"
        },
        {
          "title": "临床验证",
          "body": "国内全植入式脑机接口多中心临床试验启动，Neuralink量产预期强化技术路线关注度。"
        },
        {
          "title": "医疗刚需",
          "body": "脑卒中、脊髓损伤、帕金森等康复需求提供刚性市场，主动康复设备最先落地。"
        },
        {
          "title": "资本加速",
          "body": "强脑科技、阶梯医疗等融资活跃，一级市场热度向A股合作方和上游硬件环节传导。"
        }
      ],
      "watchlist": [
        {
          "segment": "临床试验与注册审批",
          "signals": [
            "多中心临床入组",
            "医疗器械注册证",
            "优先审批目录",
            "收费/医保口径"
          ],
          "companies": "三博脑科、博睿康、脑虎科技、强脑科技"
        },
        {
          "segment": "侵入式电极与材料",
          "signals": [
            "通道数",
            "柔性电极认证",
            "生物相容性",
            "长期稳定性"
          ],
          "companies": "康拓医疗、汉威科技、美好医疗、冠昊生物、迈普医学"
        },
        {
          "segment": "BCI专用芯片",
          "signals": [
            "神经信号处理芯片",
            "脑电采集芯片",
            "量产出货",
            "功耗/通道密度"
          ],
          "companies": "成都华微、英集芯、高德红外相关公司"
        },
        {
          "segment": "康复商业化",
          "signals": [
            "主动康复设备",
            "医院导入",
            "订单/收入",
            "临床效果数据"
          ],
          "companies": "翔宇医疗、伟思医疗、创新医疗、诚益通、爱朋医疗、麦澜德"
        },
        {
          "segment": "一级市场与非侵入式消费",
          "signals": [
            "强脑科技IPO",
            "融资金额",
            "仿生手销量",
            "消费级产品迭代"
          ],
          "companies": "强脑科技、浙江东方、蓝思科技、壹网壹创、科大讯飞"
        }
      ],
      "updates": [
        {
          "date": "2026-06-04",
          "segment": "全产业链",
          "signal": "建立脑机接口产业链基准逻辑",
          "impact": "形成“上游电极/芯片/材料 → 中游系统集成与设备 → 下游医疗康复/消费/工业应用”的跟踪框架。",
          "confidence": "基准框架",
          "sourceTitle": "脑机接口产业链深度解析原始稿",
          "sourceUrl": "./content/raw/brain-computer-interface-industry-chain-original.md",
          "notes": "初始版本来自用户提供文章，尚未逐项外部核验。"
        },
        {
          "date": "2026-06-04",
          "segment": "临床验证",
          "signal": "国内全植入式脑机接口多中心临床试验成为核心催化",
          "impact": "若入组、临床安全性和有效性顺利，将推动侵入式脑机接口从实验室进入规范化医疗器械通道。",
          "confidence": "待核验",
          "sourceTitle": "脑机接口产业链深度解析原始稿",
          "sourceUrl": "./content/raw/brain-computer-interface-industry-chain-original.md",
          "notes": "后续重点补充临床试验登记、入组进度、适应症和主要终点。"
        },
        {
          "date": "2026-06-04",
          "segment": "商业化",
          "signal": "强脑科技非侵入式康复产品和融资进展进入观察池",
          "impact": "非侵入式路线安全性更高、推广更快，是短期收入兑现更清晰的方向。",
          "confidence": "待核验",
          "sourceTitle": "脑机接口产业链深度解析原始稿",
          "sourceUrl": "./content/raw/brain-computer-interface-industry-chain-original.md",
          "notes": "后续跟踪港股IPO、仿生手/仿生腿出货、上游模组供应关系。"
        }
      ]
    },
    {
      "id": "glass-substrate",
      "title": "玻璃基板产业链",
      "shortTitle": "玻璃基板",
      "theme": "AI芯片转向先进封装，玻璃基板凭借低翘曲、低介电损耗和高平整度进入商业化验证窗口。",
      "status": "已建档",
      "trackingProfile": {
        "title": "玻璃基板专属动态追踪",
        "summary": "重点跟踪海外量产进程、封装级玻璃材料、TGV设备工艺、国内送样转订单和先进封装/CPO客户验证。",
        "metrics": [
          {
            "name": "海外商业化进程",
            "why": "英特尔、三星和台积电的量产与客户采用决定行业标准化和渗透速度。",
            "signals": [
              "量产基地进度",
              "中试线良率",
              "CoPoS路线",
              "大客户采用"
            ]
          },
          {
            "name": "TGV工艺与良率",
            "why": "成孔、金属化填充和RDL布线决定玻璃基板能否从样品走向规模量产。",
            "signals": [
              "孔径与深宽比",
              "铜填充可靠性",
              "面板级良率",
              "单位成本"
            ]
          },
          {
            "name": "国内送样转订单",
            "why": "客户认证、小批量供货和产线利用率是主题投资转向收入兑现的关键。",
            "signals": [
              "客户概念认证",
              "小批量供货",
              "正式订单",
              "TGV收入占比"
            ]
          },
          {
            "name": "AI与CPO应用",
            "why": "AI芯片载板、1.6T光模块和CPO导入决定玻璃基板的需求弹性。",
            "signals": [
              "AI芯片尺寸",
              "先进封装资本开支",
              "1.6T送样",
              "CPO量产"
            ]
          }
        ]
      },
      "article": "./content/raw/glass-substrate-industry-chain-original.md",
      "cover": "./cover-image/glass-substrate-industry-chain/glass-substrate-industry-chain-cover.png",
      "diagram": "./diagram/glass-substrate-industry-chain/glass-substrate-industry-chain-map@2x.png",
      "diagramSvg": "./diagram/glass-substrate-industry-chain/glass-substrate-industry-chain-map.svg",
      "updateFile": "./content/updates/glass-substrate-chain-updates.json",
      "chain": [
        {
          "id": "upstream",
          "title": "上游：材料与设备",
          "role": "决定玻璃基板的物理性能、通孔精度和规模化制造成本。",
          "items": [
            {
              "name": "特种玻璃与高纯原料",
              "detail": "高纯石英砂、高硼硅/铝硼硅玻璃、封装级玻璃原片",
              "companies": "彩虹股份、凯盛科技、安彩高科、南玻A"
            },
            {
              "name": "TGV激光钻孔设备",
              "detail": "高深宽比微孔、孔径一致性和加工效率是核心指标",
              "companies": "帝尔激光、迈为股份"
            },
            {
              "name": "金属化与检测设备",
              "detail": "孔内铜填充、电镀、RDL布线与缺陷检测决定量产良率",
              "companies": "三超新材等"
            }
          ]
        },
        {
          "id": "midstream",
          "title": "中游：TGV精密加工",
          "role": "价值最集中环节，将玻璃原片加工为具备高密度电气互连能力的封装基板。",
          "items": [
            {
              "name": "玻璃基封装载板平台",
              "detail": "显示玻璃能力向面板级封装载板延伸，处于试验线和客户认证阶段",
              "companies": "京东方A、彩虹股份"
            },
            {
              "name": "TGV全流程加工",
              "detail": "成孔、金属化填充、RDL布线与小批量供货",
              "companies": "沃格光电"
            },
            {
              "name": "玻璃晶圆与精密加工",
              "detail": "玻璃晶圆、精密光学加工和TGV配套能力",
              "companies": "蓝特光学、五方光电、美迪凯"
            }
          ]
        },
        {
          "id": "downstream",
          "title": "下游：先进封装与应用",
          "role": "封测厂和终端客户完成技术验证，决定玻璃基板从送样走向规模量产。",
          "items": [
            {
              "name": "先进封装与封测",
              "detail": "玻璃基板与芯片集成、晶圆级封装和大客户量产验证",
              "companies": "长电科技、晶方科技"
            },
            {
              "name": "AI芯片与高性能计算",
              "detail": "大尺寸芯片、高密度互连和低翘曲需求最强",
              "companies": "英特尔、台积电、AMD、英伟达"
            },
            {
              "name": "CPO与高频应用",
              "detail": "1.6T光模块、光电共封装、6G射频和毫米波封装",
              "companies": "沃格光电、京东方A、蓝特光学"
            }
          ]
        }
      ],
      "logic": [
        {
          "title": "先进封装材料升级",
          "body": "AI芯片尺寸和互连密度提升，使低翘曲、低损耗和高平整度成为封装基板升级的核心方向。"
        },
        {
          "title": "海外巨头验证商业化",
          "body": "英特尔、三星和台积电的产线、工艺标准和客户采用将决定玻璃基板的量产节奏。"
        },
        {
          "title": "材料设备先行",
          "body": "产业导入初期，特种玻璃、激光钻孔、金属化和检测设备通常先于下游规模收入释放订单。"
        },
        {
          "title": "国产链从送样到订单",
          "body": "国内企业能否完成客户认证、小批量供货、良率提升和正式订单，是估值兑现的关键。"
        }
      ],
      "watchlist": [
        {
          "segment": "海外商业化进程",
          "signals": [
            "英特尔量产基地",
            "三星/Absolics中试",
            "台积电CoPoS路线",
            "苹果/AMD/英伟达采用"
          ],
          "companies": "英特尔、三星电机、Absolics、台积电"
        },
        {
          "segment": "特种玻璃材料",
          "signals": [
            "封装级玻璃配方",
            "TGV基材中试",
            "客户认证",
            "良率与价格"
          ],
          "companies": "彩虹股份、凯盛科技、安彩高科、南玻A"
        },
        {
          "segment": "TGV设备与工艺",
          "signals": [
            "激光钻孔设备订单",
            "孔径与深宽比",
            "金属化填充",
            "检测设备与良率"
          ],
          "companies": "帝尔激光、迈为股份、三超新材"
        },
        {
          "segment": "玻璃基板精密加工",
          "signals": [
            "送样转订单",
            "小批量供货",
            "产线利用率",
            "TGV业务收入"
          ],
          "companies": "沃格光电、京东方A、五方光电、美迪凯、蓝特光学"
        },
        {
          "segment": "先进封装与应用",
          "signals": [
            "封测客户验证",
            "AI芯片载板",
            "1.6T/CPO送样",
            "6G射频封装"
          ],
          "companies": "长电科技、晶方科技、沃格光电、京东方A"
        }
      ],
      "updates": [
        {
          "date": "2026-06-06",
          "segment": "全产业链",
          "signal": "建立玻璃基板产业链基准逻辑",
          "impact": "形成“特种玻璃材料与设备 → TGV成孔/金属化/RDL精密加工 → 先进封装/CPO/AI应用”的跟踪框架。",
          "confidence": "基准框架",
          "sourceTitle": "玻璃基板产业链深度解析原始稿",
          "sourceUrl": "./content/raw/glass-substrate-industry-chain-original.md",
          "notes": "初始版本来自用户提供文章，行业数据和商业化时间点仍需持续外部核验。"
        },
        {
          "date": "2026-06-06",
          "segment": "商业化",
          "signal": "海外巨头玻璃基板量产与中试进度进入核心观察窗口",
          "impact": "英特尔、三星和台积电的产线与客户采用节奏，将决定玻璃基板从技术验证走向标准化量产的速度。",
          "confidence": "待核验",
          "sourceTitle": "玻璃基板产业链深度解析原始稿",
          "sourceUrl": "./content/raw/glass-substrate-industry-chain-original.md",
          "notes": "后续补充公司公告、工厂建设进度、量产时间、产能和客户采用口径。"
        },
        {
          "date": "2026-06-06",
          "segment": "国内协同",
          "signal": "京东方A与康宁合作、国内TGV企业送样成为国产链验证主线",
          "impact": "若材料、加工、封测和CPO客户形成协同验证，国内玻璃基板产业有望从概念映射进入订单兑现阶段。",
          "confidence": "待核验",
          "sourceTitle": "玻璃基板产业链深度解析原始稿",
          "sourceUrl": "./content/raw/glass-substrate-industry-chain-original.md",
          "notes": "重点跟踪试验线良率、客户概念认证、小批量供货和实际收入贡献。"
        }
      ]
    },
    {
      "id": "physical-ai",
      "title": "物理AI产业链",
      "shortTitle": "物理AI",
      "theme": "世界模型、仿真训练与具身智能加速融合，AI正从数字空间走向机器人、智能驾驶和工业现场。",
      "status": "已建档",
      "trackingProfile": {
        "title": "物理AI专属动态追踪",
        "summary": "重点跟踪世界模型能力、仿真训练效率、端侧算力、多模态感知、执行硬件和真实场景订单。",
        "metrics": [
          {
            "name": "世界模型能力",
            "why": "模型对物理规律、空间关系和动作结果的理解决定系统泛化上限。",
            "signals": [
              "模型新版本",
              "动作生成质量",
              "开源范围",
              "跨本体适配"
            ]
          },
          {
            "name": "仿真与数据闭环",
            "why": "合成数据和Sim-to-Real效率决定训练成本与产品迭代速度。",
            "signals": [
              "仿真平台订单",
              "合成数据规模",
              "迁移成功率",
              "现实数据回流"
            ]
          },
          {
            "name": "感知与执行硬件",
            "why": "传感器精度、执行器可靠性和传动良率决定数字决策能否稳定落地。",
            "signals": [
              "客户定点",
              "批量供货",
              "量产良率",
              "机器人收入占比"
            ]
          },
          {
            "name": "真实场景商业化",
            "why": "部署量、连续运行、任务成功率和客户复购是产业从演示走向生产力的证据。",
            "signals": [
              "工厂部署量",
              "运行时长",
              "任务成功率",
              "客户复购"
            ]
          }
        ]
      },
      "article": "./content/raw/physical-ai-industry-chain-original.md",
      "cover": "./cover-image/physical-ai-industry-chain/physical-ai-industry-chain-cover.png",
      "diagram": "./diagram/physical-ai-industry-chain/physical-ai-industry-chain-map@2x.png",
      "diagramSvg": "./diagram/physical-ai-industry-chain/physical-ai-industry-chain-map.svg",
      "updateFile": "./content/updates/physical-ai-chain-updates.json",
      "chain": [
        {
          "id": "infrastructure",
          "title": "底层：算力、数据与仿真",
          "role": "为世界模型和控制策略提供训练算力、合成数据与安全试错环境。",
          "items": [
            {
              "name": "AI训练与边缘算力",
              "detail": "GPU集群、AI服务器和端侧推理芯片",
              "companies": "英伟达、工业富联"
            },
            {
              "name": "物理仿真与数字孪生",
              "detail": "CAE、多物理场、合成数据和Sim-to-Real",
              "companies": "索辰科技、英伟达Isaac/Omniverse"
            },
            {
              "name": "现实数据采集",
              "detail": "视频、传感器、遥操作和动作轨迹形成训练数据",
              "companies": "盛视科技及机器人数据服务商"
            }
          ]
        },
        {
          "id": "platform",
          "title": "平台：世界模型与具身大脑",
          "role": "理解物理环境、生成动作计划，并连接模型、操作系统和机器人硬件。",
          "items": [
            {
              "name": "世界基础模型",
              "detail": "环境生成、状态预测、空间关系和物理规律建模",
              "companies": "英伟达Cosmos、国内世界模型团队"
            },
            {
              "name": "具身大脑与VLA",
              "detail": "视觉语言行动模型、任务理解和闭环控制",
              "companies": "英伟达GR00T、华为盘古、Figure AI"
            },
            {
              "name": "操作系统与开发工具",
              "detail": "模型部署、硬件适配、任务编排和生态连接",
              "companies": "英伟达Isaac、华为鸿蒙"
            }
          ]
        },
        {
          "id": "hardware",
          "title": "硬件：感知与执行",
          "role": "将现实状态转化为数字输入，再把模型决策转化为可靠物理动作。",
          "items": [
            {
              "name": "多模态感知",
              "detail": "3D视觉、力矩、六维力、IMU与电子皮肤",
              "companies": "奥比中光、柯力传感、安培龙、芯动联科、汉威科技"
            },
            {
              "name": "执行器与精密传动",
              "detail": "执行器、谐波减速器、行星滚柱丝杠和关节模组",
              "companies": "拓普集团、五洲新春、绿的谐波、恒立液压"
            },
            {
              "name": "灵巧手与微型驱动",
              "detail": "空心杯电机、微型丝杠、微型传动与触觉反馈",
              "companies": "鸣志电器、兆威机电、北特科技"
            }
          ]
        },
        {
          "id": "applications",
          "title": "应用：本体与真实场景",
          "role": "通过稳定作业、部署规模、客户复购和数据回流验证商业价值。",
          "items": [
            {
              "name": "人形机器人",
              "detail": "工厂、仓储、商业与家庭服务",
              "companies": "特斯拉Optimus、宇树科技、优必选、Figure AI"
            },
            {
              "name": "智能驾驶",
              "detail": "感知、预测、决策和车辆控制构成成熟物理AI闭环",
              "companies": "特斯拉、华为、小鹏汽车"
            },
            {
              "name": "工业自动化",
              "detail": "装配、搬运、巡检、质检和数字孪生",
              "companies": "比亚迪、小米及工业机器人厂商"
            }
          ]
        }
      ],
      "logic": [
        {
          "title": "世界模型补齐数据短板",
          "body": "仿真与生成数据覆盖稀有和危险场景，降低现实采集成本并加快策略训练。"
        },
        {
          "title": "软硬件闭环决定能力",
          "body": "算力、模型、传感器和执行系统需要共同优化，单一模型或硬件难以独立形成商业壁垒。"
        },
        {
          "title": "真实运行形成数据飞轮",
          "body": "部署后的感知、动作与异常数据回流训练系统，推动模型泛化和硬件控制持续改善。"
        },
        {
          "title": "订单和复购验证商业化",
          "body": "部署量、运行时间、任务成功率、客户复购和零部件收入，是区分演示与生产力的关键。"
        }
      ],
      "watchlist": [
        {
          "segment": "世界模型与平台",
          "signals": [
            "新版本与开源范围",
            "动作生成质量",
            "机器人形态适配",
            "真实场景案例"
          ],
          "companies": "英伟达、华为、Figure AI"
        },
        {
          "segment": "算力与仿真",
          "signals": [
            "AI服务器收入",
            "仿真产品订单",
            "客户扩张",
            "仿真到现实迁移效率"
          ],
          "companies": "工业富联、索辰科技、盛视科技"
        },
        {
          "segment": "感知系统",
          "signals": [
            "客户验证",
            "批量供应",
            "精度与延迟",
            "量产良率"
          ],
          "companies": "奥比中光、柯力传感、安培龙、芯动联科、汉威科技"
        },
        {
          "segment": "执行与精密传动",
          "signals": [
            "定点与订单",
            "扩产进度",
            "单机价值量",
            "机器人业务收入"
          ],
          "companies": "拓普集团、五洲新春、绿的谐波、鸣志电器、兆威机电"
        },
        {
          "segment": "本体与应用",
          "signals": [
            "真实部署量",
            "任务成功率",
            "连续运行时间",
            "客户复购"
          ],
          "companies": "特斯拉、宇树科技、优必选、小米、比亚迪"
        }
      ],
      "updates": [
        {
          "date": "2026-06-06",
          "segment": "全产业链",
          "signal": "建立物理AI四层产业链基准框架",
          "impact": "形成“算力与仿真 → 世界模型与中间件 → 感知执行硬件 → 本体与真实场景”的研究路径。",
          "confidence": "基准框架",
          "sourceTitle": "物理AI产业链深度解析原始稿",
          "sourceUrl": "./content/raw/physical-ai-industry-chain-original.md",
          "notes": "初始版本来自用户提供文章，涉及2026年事件、财务数据和合作关系的内容仍需逐项外部核验。"
        },
        {
          "date": "2026-06-06",
          "segment": "世界模型",
          "signal": "世界模型、视觉语言行动模型与机器人开发平台成为物理AI核心观察点",
          "impact": "若模型能够降低现实数据采集成本并提高任务泛化能力，将加快机器人和智能驾驶的商业化。",
          "confidence": "待核验",
          "sourceTitle": "物理AI产业链深度解析原始稿",
          "sourceUrl": "./content/raw/physical-ai-industry-chain-original.md",
          "notes": "后续以英伟达、华为和相关开发者平台的官方发布核验版本、能力和合作伙伴。"
        },
        {
          "date": "2026-06-06",
          "segment": "商业化",
          "signal": "真实场景部署和零部件订单进入产业兑现验证窗口",
          "impact": "工厂部署量、连续运行时间、任务成功率和客户复购将成为区分产品能力与概念映射的关键指标。",
          "confidence": "待核验",
          "sourceTitle": "物理AI产业链深度解析原始稿",
          "sourceUrl": "./content/raw/physical-ai-industry-chain-original.md",
          "notes": "重点跟踪本体厂公告、供应商定点、订单、产能利用率和机器人业务收入。"
        }
      ]
    },
    {
      "id": "semiconductor-material",
      "title": "半导体材料产业链",
      "shortTitle": "半导体材料",
      "theme": "晶圆厂扩产与AI需求共振，硅片、光刻胶、电子特气、CMP、靶材和封装材料进入国产替代兑现期。",
      "status": "已建档",
      "trackingProfile": {
        "title": "半导体材料专属动态追踪",
        "summary": "重点跟踪晶圆厂扩产、高端材料客户认证、国产份额、价格交期、量产良率和先进封装材料放量。",
        "metrics": [
          {
            "name": "晶圆厂扩产与稼动率",
            "why": "晶圆厂资本开支、新产能投产和稼动率决定材料需求的总量与持续性。",
            "signals": [
              "资本开支",
              "新增晶圆产能",
              "产能利用率",
              "材料采购量"
            ]
          },
          {
            "name": "高端材料客户认证",
            "why": "光刻胶、光掩模版、CMP和靶材验证周期长，认证与批量供货是国产替代的核心证据。",
            "signals": [
              "制程节点",
              "客户验证",
              "批量供货",
              "材料收入占比"
            ]
          },
          {
            "name": "价格、交期与盈利",
            "why": "电子特气和高纯化学品的报价、交期与毛利率能够反映真实供需紧张程度。",
            "signals": [
              "产品报价",
              "交付周期",
              "毛利率",
              "经营现金流"
            ]
          },
          {
            "name": "先进封装材料放量",
            "why": "AI芯片与先进封装提升FC-BGA基板、塑封料和引线框架的性能要求与单机价值。",
            "signals": [
              "FC-BGA量产",
              "先进封装订单",
              "产线良率",
              "客户导入"
            ]
          }
        ]
      },
      "article": "./content/raw/semiconductor-material-industry-chain-original.md",
      "cover": "./cover-image/semiconductor-material-industry-chain/semiconductor-material-industry-chain-cover.png",
      "diagram": "./diagram/semiconductor-material-industry-chain/semiconductor-material-industry-chain-map@2x.png",
      "diagramSvg": "./diagram/semiconductor-material-industry-chain/semiconductor-material-industry-chain-map.svg",
      "updateFile": "./content/updates/semiconductor-material-chain-updates.json",
      "chain": [
        {
          "id": "upstream",
          "title": "上游：基础原料与制造设备",
          "role": "提供高纯硅料、金属与化工原料，以及材料提纯、晶体生长和检测设备。",
          "items": [
            {
              "name": "高纯硅与衬底原料",
              "detail": "电子级多晶硅、石英坩埚和晶体生长原料决定硅片纯度",
              "companies": "沪硅产业、TCL中环、立昂微"
            },
            {
              "name": "高纯金属与化工原料",
              "detail": "铜、铝、钨、钽及高纯酸碱、树脂和光敏材料",
              "companies": "江丰电子、雅克科技及高纯化工供应商"
            },
            {
              "name": "材料制造与检测设备",
              "detail": "拉晶、切磨抛、提纯、混配、缺陷检测与洁净输送",
              "companies": "晶盛机电等材料设备与检测厂商"
            }
          ]
        },
        {
          "id": "wafer-materials",
          "title": "核心：晶圆制造材料",
          "role": "约占全球半导体材料市场六成，贯穿光刻、刻蚀、沉积、清洗和平坦化。",
          "items": [
            {
              "name": "硅片",
              "detail": "300mm抛光片、外延片与SOI片，是芯片制造的基础衬底",
              "companies": "沪硅产业、TCL中环、立昂微"
            },
            {
              "name": "光刻胶",
              "detail": "g/i线、KrF、ArF与EUV胶，先进制程国产化率最低",
              "companies": "彤程新材、南大光电、上海新阳、鼎龙股份、雅克科技"
            },
            {
              "name": "电子特气",
              "detail": "用于刻蚀、成膜、清洗、光刻和掺杂，纯度与稳定供应是关键",
              "companies": "中船特气、华特气体、金宏气体、昊华科技"
            },
            {
              "name": "湿电子化学品与CMP",
              "detail": "高纯酸碱、清洗液、抛光液和抛光垫支撑清洗与晶圆平坦化",
              "companies": "安集科技、晶瑞电材、江化微、鼎龙股份"
            },
            {
              "name": "溅射靶材",
              "detail": "PVD金属薄膜沉积材料，覆盖铝、钛、铜、钽等高纯靶材",
              "companies": "江丰电子"
            },
            {
              "name": "光掩模版",
              "detail": "承载电路图形的高精度光刻底片，中高端国产化率仍低",
              "companies": "路维光电、清溢光电、冠石科技、龙图光罩"
            },
            {
              "name": "前驱体与其他工艺材料",
              "detail": "ALD/CVD前驱体、电镀液、蚀刻液和清洗液构成材料平台",
              "companies": "雅克科技、上海新阳、南大光电"
            }
          ]
        },
        {
          "id": "packaging-materials",
          "title": "中后道：封装材料",
          "role": "先进封装提高基板、互连和包封材料的性能要求，是增速更快的价值环节。",
          "items": [
            {
              "name": "封装基板",
              "detail": "FC-CSP、FC-BGA等高密度载板连接芯片与PCB",
              "companies": "深南电路、兴森科技"
            },
            {
              "name": "引线框架与键合材料",
              "detail": "冲压/蚀刻引线框架、键合丝和互连材料",
              "companies": "康强电子"
            },
            {
              "name": "包封与先进封装材料",
              "detail": "环氧塑封料、底部填充与高可靠包封材料",
              "companies": "华海诚科、鼎龙股份"
            }
          ]
        },
        {
          "id": "downstream",
          "title": "下游：晶圆制造与封装测试",
          "role": "晶圆厂和封测厂的认证、采购与扩产最终决定材料企业的收入和盈利兑现。",
          "items": [
            {
              "name": "晶圆代工与逻辑制造",
              "detail": "先进逻辑、成熟制程和特色工艺持续拉动工艺材料需求",
              "companies": "中芯国际、华虹公司等"
            },
            {
              "name": "存储芯片制造",
              "detail": "DRAM、NAND与HBM扩产增加硅片、前驱体、特气和CMP用量",
              "companies": "长江存储、长鑫科技等"
            },
            {
              "name": "封装测试",
              "detail": "先进封装与传统封装共同拉动基板、引线框架和塑封料",
              "companies": "长电科技、通富微电、华天科技等"
            }
          ]
        }
      ],
      "logic": [
        {
          "title": "晶圆厂扩产形成需求底座",
          "body": "国内逻辑与存储产能持续建设，材料消耗随晶圆产出增长，并由一次性设备投资转化为长期耗材需求。"
        },
        {
          "title": "低国产化率打开替代空间",
          "body": "ArF光刻胶、高端掩模版、靶材和先进封装基板仍高度依赖进口，客户认证突破将直接带来份额提升。"
        },
        {
          "title": "高壁垒材料进入业绩验证",
          "body": "行业观察重点从概念布局转向批量供货、收入占比、毛利率、良率和经营现金流。"
        },
        {
          "title": "AI推动先进制程与封装升级",
          "body": "AI芯片、HBM和先进封装提高光刻、沉积、CMP及FC-BGA材料的用量和性能门槛。"
        }
      ],
      "watchlist": [
        {
          "segment": "晶圆厂扩产与材料需求",
          "signals": [
            "晶圆厂资本开支",
            "新增产能投产",
            "材料采购量",
            "产能利用率"
          ],
          "companies": "中芯国际、华虹公司、长江存储、长鑫科技"
        },
        {
          "segment": "硅片与衬底",
          "signals": [
            "300mm产能",
            "客户认证",
            "稼动率",
            "折旧与毛利率"
          ],
          "companies": "沪硅产业、TCL中环、立昂微"
        },
        {
          "segment": "光刻胶与光掩模版",
          "signals": [
            "高端胶客户验证",
            "批量销售收入",
            "制程节点突破",
            "掩模版交付"
          ],
          "companies": "彤程新材、南大光电、上海新阳、鼎龙股份、路维光电、清溢光电"
        },
        {
          "segment": "电子特气与湿电子化学品",
          "signals": [
            "产品价格与交期",
            "高纯等级",
            "晶圆厂导入",
            "经营现金流"
          ],
          "companies": "中船特气、华特气体、金宏气体、昊华科技、晶瑞电材、江化微"
        },
        {
          "segment": "CMP与溅射靶材",
          "signals": [
            "新产品验证",
            "国产份额",
            "先进制程适配",
            "毛利率"
          ],
          "companies": "安集科技、鼎龙股份、江丰电子"
        },
        {
          "segment": "封装材料",
          "signals": [
            "FC-BGA量产",
            "产线良率",
            "先进封装订单",
            "材料收入占比"
          ],
          "companies": "深南电路、兴森科技、康强电子、华海诚科"
        }
      ],
      "updates": [
        {
          "date": "2026-06-12",
          "segment": "全产业链",
          "signal": "重建半导体材料产业链正式基准框架",
          "impact": "形成“基础原料与设备 → 晶圆制造七大材料 → 封装材料 → 晶圆厂与封测厂”的研究和动态追踪路径。",
          "confidence": "基准框架",
          "sourceTitle": "半导体材料产业链深度解析完整终版",
          "sourceUrl": "./content/raw/semiconductor-material-industry-chain-original.md",
          "notes": "本版以用户提供的完整终稿为基础，财务数据、市场规模与客户关系仍应结合公告和权威行业资料持续核验。"
        },
        {
          "date": "2026-06-12",
          "segment": "晶圆制造材料",
          "signal": "光刻胶、电子特气、CMP和光掩模版成为高壁垒国产替代主线",
          "impact": "这些环节国产化率低、验证周期长，客户认证与批量收入比概念映射更能验证产业兑现。",
          "confidence": "待核验",
          "sourceTitle": "半导体材料产业链深度解析完整终版",
          "sourceUrl": "./content/raw/semiconductor-material-industry-chain-original.md",
          "notes": "后续重点记录客户认证、量产节点、收入占比、毛利率和经营现金流。"
        },
        {
          "date": "2026-06-12",
          "segment": "封装材料",
          "signal": "AI与先进封装推动FC-BGA基板、引线框架和塑封料价值量提升",
          "impact": "封装材料市场增速高于晶圆制造材料，国内企业从传统封装向高端载板和先进封装材料升级。",
          "confidence": "待核验",
          "sourceTitle": "半导体材料产业链深度解析完整终版",
          "sourceUrl": "./content/raw/semiconductor-material-industry-chain-original.md",
          "notes": "重点跟踪FC-BGA批量进度、产能利用率、良率和先进封装客户订单。"
        }
      ]
    }
  ]
};
