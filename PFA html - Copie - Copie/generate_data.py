import csv
import json
from io import StringIO

csv_data = """id_culture,titre,categorie,description,image,ville
"1","Fondation de Fès","histoire","Découvrez Fès, la capitale spirituelle du Maroc fondée au 9ème siècle par Idriss II, célèbre pour sa médina ancienne.","histoire_fes.jpg","Fès"
"2","Les remparts de Marrakech","histoire","La ville rouge est entourée de magnifiques remparts en pisé datant de la dynastie almoravide.","remparts_kech.jpg","Marrakech"
"3","La cité impériale de Meknès","histoire","Meknès, la ville de Moulay Ismaïl, est connue pour ses portes monumentales et ses murailles immenses.","meknes_imperial.jpg","Meknès"
"4","Bab Mansour","histoire","L'une des plus belles et plus grandes portes du Maroc, symbole de l'architecture mauresque.","bab_mansour.jpg","Meknès"
"5","Volubilis","histoire","Les ruines romaines de Volubilis offrent un voyage dans le temps avec des mosaïques exceptionnellement préservées.","volubilis.jpg","Meknès"
"6","Palais Bahia","histoire","Un chef-d'œuvre de l'architecture marocaine du 19ème siècle, avec ses jardins et ses cours décorées.","palais_bahia.jpg","Marrakech"
"7","L'Université Al Quaraouiyine","histoire","La plus ancienne université encore en activité au monde, située au cœur de la médina.","quaraouiyine.jpg","Fès"
"8","Médersa Bou Inania","histoire","Une école islamique historique connue pour son architecture mérinide magnifique et ses détails en zellige.","bou_inania.jpg","Fès"
"9","Les Tombeaux Saadiens","histoire","Un mausolée royal richement décoré, redécouvert au début du 20ème siècle.","tombeaux_saadiens.jpg","Marrakech"
"10","La Place Jemaa el-Fna","histoire","Le cœur battant de Marrakech depuis des siècles, classé au patrimoine oral de l'UNESCO.","jemaa_fna.jpg","Marrakech"
"11","L'hospitalité marocaine","tradition","Le sens de l'accueil est sacré au Maroc. Les invités sont toujours reçus avec générosité, thé et pâtisseries.","hospitalite.jpg",""
"12","Le Caftan marocain","tradition","Tenue traditionnelle féminine d'une grande élégance, portée lors des mariages et des grandes occasions.","caftan.jpg",""
"13","La Djellaba","tradition","Vêtement traditionnel long et à capuche, porté au quotidien par les hommes et les femmes.","djellaba.jpg",""
"14","Le Mariage traditionnel","tradition","Une célébration grandiose qui dure souvent plusieurs jours, marquée par les tenues, la musique et le banquet.","mariage_marocain.jpg",""
"15","La cérémonie du Henné","tradition","Rituel de beauté et de bénédiction pour la mariée, où l'on dessine des motifs complexes sur ses mains et pieds.","henne.jpg",""
"16","Le Hammam marocain","tradition","Un lieu de purification et de lien social, essentiel dans la vie culturelle marocaine.","hammam.jpg",""
"17","La Tbourida (Fantasia)","tradition","Un art martial équestre traditionnel simulant des charges militaires historiques, très populaire lors des moussems.","tbourida.jpg",""
"18","Le Tarbouche","tradition","Le couvre-chef traditionnel rouge, symbole d'élégance classique, souvent fabriqué à Fès.","tarbouche.jpg","Fès"
"19","La culture du vendredi","tradition","Le vendredi est un jour saint marqué par la prière à la mosquée et le partage du couscous en famille.","vendredi_couscous.jpg",""
"20","Les Moussems","tradition","Des rassemblements annuels festifs et spirituels honorant souvent un saint local.","moussem.jpg",""
"21","Le Couscous aux 7 légumes","gastronomie","Le plat national par excellence, préparé avec de la semoule, de la viande et une variété de légumes.","couscous.jpg",""
"22","Le Tajine de poulet au citron","gastronomie","Un classique de la cuisine marocaine, mijoté lentement avec des olives et du citron confit.","tajine_poulet.jpg",""
"23","La Pastilla au pigeon","gastronomie","Un plat sucré-salé raffiné, originaire d'Andalousie et perfectionné à Fès, fait de feuilles de brick, amandes et viande.","pastilla_fes.jpg","Fès"
"24","Le Thé à la menthe","gastronomie","Le whisky berbère. Symbole de l'hospitalité, il est servi brûlant et sucré à tout moment de la journée.","the_menthe.jpg",""
"25","La Harira","gastronomie","Une soupe riche à base de tomates, lentilles et pois chiches, traditionnellement consommée pour rompre le jeûne du Ramadan.","harira.jpg",""
"26","La Tanjia Marrakchia","gastronomie","Un plat de viande épicée cuit lentement dans une jarre en terre cuite dans les cendres du hammam.","tanjia.jpg","Marrakech"
"27","Les Chebakia","gastronomie","Des pâtisseries frites enrobées de miel et de sésame, incontournables pendant le mois sacré.","chebakia.jpg",""
"28","Le pain Tafarnout","gastronomie","Un pain traditionnel amazigh cuit sur des galets chauds dans un four en terre.","tafarnout.jpg",""
"29","Les Cornes de gazelle","gastronomie","La reine des pâtisseries marocaines, à base de pâte fine, d'amandes et d'eau de fleur d'oranger.","cornes_gazelle.jpg",""
"30","L'huile d'Argan culinaire","gastronomie","Une huile précieuse au goût de noisette, utilisée dans l'Amlou ou pour relever les plats.","huile_argan.jpg","Essaouira"
"31","Le Zellige","artisanat","L'art de la mosaïque géométrique marocaine, utilisant des carreaux de faïence taillés à la main.","zellige.jpg","Fès"
"32","Les tapis berbères","artisanat","Chaque région a son style, avec des motifs géométriques racontant l'histoire des tisseuses de l'Atlas.","tapis_berbere.jpg",""
"33","La poterie et céramique","artisanat","Des créations en terre cuite aux motifs bleus distinctifs, une spécialité reconnue de la région.","poterie_fes.jpg","Fès"
"34","La tannerie et le travail du cuir","artisanat","Le traitement traditionnel des peaux dans des bassins colorés pour créer sacs, babouches et poufs.","tannerie_fes.jpg","Fès"
"35","La marqueterie en bois de Thuya","artisanat","Un travail minutieux du bois aromatique de thuya, incrusté de citronnier, typique de la côte.","thuya_essaouira.jpg","Essaouira"
"36","Les Babouches (Balgha)","artisanat","Les chaussures traditionnelles en cuir souple, portées aussi bien par les hommes que par les femmes.","babouches.jpg",""
"37","La Dinanderie (cuivre et laiton)","artisanat","La fabrication de lanternes, plateaux et théières martelés à la main par des artisans qualifiés.","dinanderie_marrakech.jpg","Marrakech"
"38","La broderie de Fès","artisanat","Un art textile délicat, souvent bleu sur fond blanc, utilisé pour décorer le linge de maison.","broderie_fes.jpg","Fès"
"39","Les bijoux en argent","artisanat","L'artisanat amazigh excelle dans la création de bijoux en argent massif ornés de pierres semi-précieuses.","bijoux_argent.jpg","Essaouira"
"40","La sparterie et vannerie","artisanat","Le tressage de feuilles de palmier ou d'osier pour créer des paniers, des chapeaux et des tapis.","vannerie.jpg",""
"41","Festival Gnaoua et Musiques du Monde","festival","Un festival unique qui célèbre la musique mystique Gnaoua en invitant des artistes du monde entier.","festival_gnaoua.jpg","Essaouira"
"42","Festival Mawazine","festival","L'un des plus grands festivals de musique au monde, accueillant des stars internationales et locales.","festival_mawazine.jpg","Rabat"
"43","Festival des Musiques Sacrées du Monde","festival","Une rencontre spirituelle et musicale dans les décors historiques de la capitale spirituelle.","musiques_sacrees.jpg","Fès"
"44","Festival International du Film","festival","Le rendez-vous glamour du cinéma africain et international, attirant les plus grandes stars.","fifm_marrakech.jpg","Marrakech"
"45","Festival des Roses","festival","Une célébration printanière de la récolte de la rose de Damas dans la vallée du Dadès.","festival_roses.jpg",""
"46","Festival des Cerises","festival","Le plus vieux festival du Maroc, couronnant chaque année la Reine des Cerises.","festival_cerises.jpg",""
"47","Tanjazz","festival","Le festival qui fait swinguer la ville du détroit avec des rythmes de jazz du monde entier.","tanjazz.jpg",""
"48","Timitar","festival","Un festival dédié à la culture amazighe et aux musiques du monde, sous le signe de l'ouverture.","timitar.jpg",""
"49","Festival des Dattes","festival","Une mise en valeur du patrimoine oasien et de la récolte des dattes dans le sud marocain.","festival_dattes.jpg",""
"50","Le Marrakech du Rire","festival","Le festival international d'humour qui réunit les meilleurs humoristes francophones et arabophones.","marrakech_rire.jpg","Marrakech"
"""

categories = {
    "histoire": {
        "title": "Histoire du Maroc",
        "description": "Découvrez l'héritage millénaire et les joyaux architecturaux des grandes villes impériales marocaines.",
        "icon": '<i class="fa-solid fa-landmark-dome"></i>',
        "color": "#FF6D00",
        "bgClass": "bg-orange-light",
        "items": []
    },
    "traditions": {
        "title": "Traditions et coutumes",
        "description": "Plongez dans l'art de vivre marocain, fait de partage, de célébrations joyeuses et d'hospitalité légendaire.",
        "icon": '<i class="fa-solid fa-handshake-angle"></i>',
        "color": "#00C853",
        "bgClass": "bg-green-light",
        "items": []
    },
    "gastronomie": {
        "title": "Gastronomie marocaine",
        "description": "Un voyage culinaire à travers les épices, les saveurs sucrées-salées et les plats parfumés mondialement connus.",
        "icon": '<i class="fa-solid fa-utensils"></i>',
        "color": "#FFAB00",
        "bgClass": "bg-yellow-light",
        "items": []
    },
    "artisanat": {
        "title": "Artisanat marocain",
        "description": "Le savoir-faire exceptionnel des maîtres artisans se reflète dans chaque mosaïque, tapis et objet en cuir.",
        "icon": '<i class="fa-solid fa-palette"></i>',
        "color": "#0091EA",
        "bgClass": "bg-blue-light",
        "items": []
    },
    "festivals": {
        "title": "Festivals et événements",
        "description": "Une scène culturelle vibrante qui mêle musiques spirituelles anciennes et rythmes contemporains internationaux.",
        "icon": '<i class="fa-solid fa-music"></i>',
        "color": "#9C27B0",
        "bgClass": "bg-purple-light",
        "items": []
    }
}

cat_map = {
    "histoire": "histoire",
    "tradition": "traditions",
    "gastronomie": "gastronomie",
    "artisanat": "artisanat",
    "festival": "festivals"
}

reader = csv.DictReader(StringIO(csv_data))
for row in reader:
    cat_key = cat_map.get(row["categorie"], "")
    if cat_key:
        categories[cat_key]["items"].append({
            "title": row["titre"],
            "subtitle": row["ville"] if row["ville"] else "Maroc",
            "image": "images/" + row["image"],
            "description": row["description"]
        })

js_content = "const cultureData = " + json.dumps(categories, indent=4, ensure_ascii=False) + ";"

with open(r"c:\Users\Administrator\Downloads\pfa (2)\pfa (1)\pfa (1)\pfa\PFA html - Copie - Copie\culture_data.js", "w", encoding="utf-8") as f:
    f.write(js_content)

print("Data successfully generated and written to culture_data.js")
