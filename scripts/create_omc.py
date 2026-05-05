content = """|| OMC, Exhaustif, Institutions, QCM
QCM || En quelle année a été créé le GATT ? || 1944|V:1947|1948|1995
|| Le GATT (Accord général sur les tarifs douaniers et le commerce) a été signé par 23 pays en 1947, dans la dynamique des accords de Bretton Woods. || OMC, Historique, Facile, QCM
QCM || Où s'est tenue la réunion qui a abouti aux accords de Bretton Woods ? || À Genève|À Marrakech|V:Aux États-Unis|Au Royaume-Uni
|| En 1947, les Alliés se sont retrouvés à Bretton Woods (aux États-Unis) pour mettre en place des institutions de régulation des relations économiques internationales. || OMC, Bretton Woods, Facile, QCM
QCM || Quelle était la conviction principale des Alliés lors de la création du GATT ? || Que la guerre était due à un manque de commerce|V:Que le conflit était dû à la gestion nationaliste de la crise de 1929|Que seule l'Europe devait commercer|Que les tarifs douaniers devaient augmenter
|| Les Alliés étaient persuadés que le conflit de la Seconde Guerre mondiale était dû à la gestion nationaliste de la flambée du chômage de la grande crise déclenchée en 1929 à Wall Street. || OMC, Contexte historique, Moyen, QCM"""

with open("src/questions/S1/INSTIT/OMC_QCM_EXHAUSTIF_v1.txt", "w", encoding="utf-8") as f:
    f.write(content)
print("Fichier créé : 3 questions de test")
