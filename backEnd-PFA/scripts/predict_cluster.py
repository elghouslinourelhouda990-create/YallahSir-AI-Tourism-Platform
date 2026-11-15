import sys
import json
import math

# Mapping du type vers un poids
TYPE_MAP = {
    'culture': 1,
    'aventure': 2,
    'relax': 3,
    'luxe': 4
}

def determine_cluster(duree, budget, type_itineraire, nombre_lieux, clusters):
    if not clusters:
        print(json.dumps({"error": "Aucun cluster fourni."}))
        sys.exit(1)

    type_encoded = TYPE_MAP.get(type_itineraire.lower(), 1)
    new_point = [float(duree), float(budget), float(type_encoded), float(nombre_lieux)]

    # Définition de "Centroïdes Idéaux" basés sur les mots clés du nom avec dict python standard
    ideal_centroids = {}
    for c in clusters:
        c_id = str(c.get('_id', ''))
        nom = c.get('nom', '').lower()
        if 'économique' in nom or 'court' in nom:
            ideal_centroids[c_id] = [2.0, 500.0, TYPE_MAP['culture'], 2.0]
        elif 'moyen' in nom or 'équilibré' in nom:
            ideal_centroids[c_id] = [5.0, 3000.0, TYPE_MAP['relax'], 4.0]
        elif 'luxe' in nom or 'long' in nom:
            ideal_centroids[c_id] = [10.0, 15000.0, TYPE_MAP['luxe'], 7.0]
        elif 'aventure' in nom:
            ideal_centroids[c_id] = [4.0, 2000.0, TYPE_MAP['aventure'], 3.0]
        elif 'culture' in nom or 'urbain' in nom:
            ideal_centroids[c_id] = [3.0, 1500.0, TYPE_MAP['culture'], 5.0]
        elif 'relax' in nom or 'plage' in nom:
            ideal_centroids[c_id] = [7.0, 4000.0, TYPE_MAP['relax'], 2.0]
        else:
            ideal_centroids[c_id] = [3.0, 1000.0, 1.0, 3.0]

    def normalize(point):
        return [
            point[0] / 15.0,
            point[1] / 20000.0,
            point[2] / 4.0,
            point[3] / 10.0
        ]

    new_point_norm = normalize(new_point)

    best_cluster_id = None
    min_dist = float('inf')

    # Distance Euclidienne simple
    for c_id, centroid in ideal_centroids.items():
        centroid_norm = normalize(centroid)
        # Sum of squared differences
        dist = math.sqrt(sum((a - b) ** 2 for a, b in zip(new_point_norm, centroid_norm)))
        if dist < min_dist:
            min_dist = dist
            best_cluster_id = c_id

    print(json.dumps({"cluster_id": best_cluster_id}))


if __name__ == "__main__":
    try:
        input_data = json.loads(sys.argv[1])
        duree = input_data.get('duree', 1)
        budget = input_data.get('budget', 0)
        type_itineraire = input_data.get('type', 'culture')
        nombre_lieux = input_data.get('nombre_lieux', 0)
        clusters = input_data.get('clusters', [])
        
        determine_cluster(duree, budget, type_itineraire, nombre_lieux, clusters)
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
