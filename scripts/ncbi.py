import json

from os import path
from ftplib import FTP

ftp_server = "ftp.ncbi.nlm.nih.gov"
refseq_base = "/genomes/refseq"

dump_fp = "./genomes.json"

categories = [
  "vertebrate_other",
  "vertebrate_mammalian",
  "protozoa",
  "plant",
  "invertebrate",
  "fungi",
  "bacteria",
  "archaea",
]

if __name__ == "__main__":
  ftp = FTP(ftp_server)
  ftp.login()

  database = []

  for cat in categories:
    fp = path.join(refseq_base, cat)
    ftp.cwd(fp)

    entries = ftp.nlst()
    print(cat, len(entries))

    for gen in entries:
      gen = gen.replace("_", " ")

      database.append({
        "category": cat,
        "genome": gen,
      })

  with open(dump_fp, "w") as f:
    json.dump(database, f, indent=2)
