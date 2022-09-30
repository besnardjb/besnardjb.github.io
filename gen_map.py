#!/bin/env python

import json

data = {}

with open("map.json", 'r') as f:
        data = json.load(f)
        print(data)


head = """
<?xml version="1.0" encoding="UTF-8"?>
<urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

<url>
  <loc>https://www.jbbesnard.pro/</loc>
  <changefreq>weekly</changefreq>
</url>
"""

foot="</urlset>"


urls=[]

for k in data:
        for v in data[k]:
                url=data[k][v]
                if url.startswith("/"):
                        #is local
                        if url.endswith(".md"):
                                url="#"+url
                        url="https://www.jbbesnard.pro/" + url
                        urls.append(url)
                else:
                        continue



with open("./sitemap.xml", "w") as f:
        f.write(head)

        for u in urls:
                f.write(
"""
<url>
  <loc>{}</loc>
  <changefreq>weekly</changefreq>
</url>
""".format(u)
                )

        f.write(foot)