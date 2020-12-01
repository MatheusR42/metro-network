import networkx as nx
import pandas as pd
import matplotlib.pyplot as plt

dfNodes = pd.read_csv('../sao-paulo/nodes.csv')
dfVertices = pd.read_csv('../sao-paulo/vertices.csv')

def getNodes():
  nodes = []
  for index, row in dfNodes.iterrows():
    nodes.append((row["Id"], {
      "color": row["Color"],
      "LineName": row["LineName"],
      "Line": row["Line"],
    }))

  return nodes

def getEdges():
  edges = []
  for index, row in dfVertices.iterrows():
    edges.append((row['Source'], row['Target']))

  return edges

G = nx.Graph()
G.add_nodes_from(getNodes())
G.add_edges_from(getEdges())

print("Assortatividade de Grau = ", nx.degree_assortativity_coefficient(G))
print("Assortatividade de Linha = ", nx.attribute_assortativity_coefficient(G, 'Line'))