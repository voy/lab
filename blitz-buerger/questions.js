const QUESTIONS = [
  {
    "id": "gen-001",
    "text": "In Deutschland dürfen Menschen offen etwas gegen die Regierung sagen, weil …",
    "choices": [
      "hier Religionsfreiheit gilt.",
      "die Menschen Steuern zahlen.",
      "die Menschen das Wahlrecht haben.",
      "hier Meinungsfreiheit gilt."
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-002",
    "text": "In Deutschland können Eltern bis zum 14. Lebensjahr ihres Kindes entscheiden, ob es in der Schule am …",
    "choices": [
      "Geschichtsunterricht teilnimmt.",
      "Religionsunterricht teilnimmt.",
      "Politikunterricht teilnimmt.",
      "Sprachunterricht teilnimmt."
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-003",
    "text": "Deutschland ist ein Rechtsstaat. Was ist damit gemeint?",
    "choices": [
      "Alle Einwohnerinnen/Einwohner und der Staat müssen sich an die Gesetze halten.",
      "Der Staat muss sich nicht an die Gesetze halten.",
      "Nur Deutsche müssen die Gesetze befolgen.",
      "Die Gerichte machen die Gesetze."
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-004",
    "text": "Welches Recht gehört zu den Grundrechten in Deutschland?",
    "choices": [
      "Waffenbesitz",
      "Faustrecht",
      "Meinungsfreiheit",
      "Selbstjustiz"
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-005",
    "text": "Wahlen in Deutschland sind frei. Was bedeutet das?",
    "choices": [
      "Man darf Geld annehmen, wenn man dafür eine bestimmte Kandidatin/einen bestimmten Kandidaten wählt.",
      "Nur Personen, die noch nie im Gefängnis waren, dürfen wählen.",
      "Die Wählerin/der Wähler darf bei der Wahl weder beeinflusst noch zu einer bestimmten Stimmabgabe gezwungen werden und keine Nachteile durch die Wahl haben.",
      "Alle wahlberechtigten Personen müssen wählen."
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-006",
    "text": "Wie heißt die deutsche Verfassung?",
    "choices": [
      "Volksgesetz",
      "Bundesgesetz",
      "Deutsches Gesetz",
      "Grundgesetz"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-007",
    "text": "Welches Recht gehört zu den Grundrechten, die nach der deutschen Verfassung garantiert werden? Das Recht auf …",
    "choices": [
      "Glaubens- und Gewissensfreiheit",
      "Unterhaltung",
      "Arbeit",
      "Wohnung"
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-008",
    "text": "Was steht nicht im Grundgesetz von Deutschland?",
    "choices": [
      "Die Würde des Menschen ist unantastbar.",
      "Alle sollen gleich viel Geld haben.",
      "Jeder Mensch darf seine Meinung sagen.",
      "Alle sind vor dem Gesetz gleich."
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-009",
    "text": "Welches Grundrecht gilt in Deutschland nur für Ausländerinnen/Ausländer? Das Grundrecht auf …",
    "choices": [
      "Schutz der Familie",
      "Menschenwürde",
      "Asyl",
      "Meinungsfreiheit"
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-010",
    "text": "Was ist mit dem deutschen Grundgesetz vereinbar?",
    "choices": [
      "die Prügelstrafe",
      "die Folter",
      "die Todesstrafe",
      "die Geldstrafe"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-011",
    "text": "Wie wird die Verfassung der Bundesrepublik Deutschland genannt?",
    "choices": [
      "Grundgesetz",
      "Bundesverfassung",
      "Gesetzbuch",
      "Verfassungsvertrag"
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-012",
    "text": "Eine Partei im Deutschen Bundestag will die Pressefreiheit abschaffen. Ist das möglich?",
    "choices": [
      "Ja, wenn mehr als die Hälfte der Abgeordneten im Bundestag dafür sind.",
      "Ja, aber dazu müssen zwei Drittel der Abgeordneten im Bundestag dafür sein.",
      "Nein, denn die Pressefreiheit ist ein Grundrecht. Sie kann nicht abgeschafft werden.",
      "Nein, denn nur der Bundesrat kann die Pressefreiheit abschaffen."
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-013",
    "text": "Im Parlament steht der Begriff \"Opposition\" für …",
    "choices": [
      "die regierenden Parteien.",
      "die Fraktion mit den meisten Abgeordneten.",
      "alle Parteien, die bei der letzten Wahl die 5%-Hürde erreichen konnten.",
      "alle Abgeordneten, die nicht zu der Regierungspartei/den Regierungsparteien gehören."
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-014",
    "text": "Meinungsfreiheit in Deutschland heißt, dass ich …",
    "choices": [
      "Passanten auf der Straße beschimpfen darf.",
      "meine Meinung im Internet äußern kann.",
      "Nazi-, Hamas- oder Islamischer Staat-Symbole öffentlich tragen darf.",
      "meine Meinung nur dann äußern darf, solange ich der Regierung nicht widerspreche."
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-015",
    "text": "Was verbietet das deutsche Grundgesetz?",
    "choices": [
      "Militärdienst",
      "Zwangsarbeit",
      "freie Berufswahl",
      "Arbeit im Ausland"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-016",
    "text": "Wann ist die Meinungsfreiheit in Deutschland eingeschränkt?",
    "choices": [
      "bei der öffentlichen Verbreitung falscher Behauptungen über einzelne Personen",
      "bei Meinungsäußerungen über die Bundesregierung",
      "bei Diskussionen über Religionen",
      "bei Kritik am Staat"
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": [
      "staatsorgane",
      "daten-jahre"
    ]
  },
  {
    "id": "gen-017",
    "text": "Die deutschen Gesetze verbieten …",
    "choices": [
      "Meinungsfreiheit der Einwohnerinnen und Einwohner.",
      "Petitionen der Bürgerinnen und Bürger.",
      "Versammlungsfreiheit der Einwohnerinnen und Einwohner.",
      "Ungleichbehandlung der Bürgerinnen und Bürger durch den Staat."
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-018",
    "text": "Welches Grundrecht ist in Artikel 1 des Grundgesetzes der Bundesrepublik Deutschland garantiert?",
    "choices": [
      "die Unantastbarkeit der Menschenwürde",
      "das Recht auf Leben",
      "Religionsfreiheit",
      "Meinungsfreiheit"
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-019",
    "text": "Was versteht man unter dem Recht der \"Freizügigkeit\" in Deutschland?",
    "choices": [
      "Man darf sich seinen Wohnort selbst aussuchen.",
      "Man kann seinen Beruf wechseln.",
      "Man darf sich für eine andere Religion entscheiden.",
      "Man darf sich in der Öffentlichkeit nur leicht bekleidet bewegen."
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-020",
    "text": "Eine Partei in Deutschland verfolgt das Ziel, eine Diktatur zu errichten. Sie ist dann …",
    "choices": [
      "tolerant.",
      "rechtsstaatlich orientiert.",
      "gesetzestreu.",
      "verfassungswidrig."
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-021",
    "text": "Welches ist das Wappen der Bundesrepublik Deutschland?",
    "choices": [
      "Bundesadler auf goldenem Grund (Wappen der Bundesrepublik Deutschland)",
      "Reichsadler mit Krone (historisches Wappen des Deutschen Kaiserreichs)",
      "Hammer, Sichel und Ährenkranz (Wappen der DDR)",
      "Preußischer Adler mit Zepter und Reichsapfel"
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": [],
    "imageOnly": true,
    "image": "images/wappen-brd.svg"
  },
  {
    "id": "gen-022",
    "text": "Was für eine Staatsform hat Deutschland?",
    "choices": [
      "Monarchie",
      "Diktatur",
      "Republik",
      "Fürstentum"
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-023",
    "text": "In Deutschland sind die meisten Erwerbstätigen …",
    "choices": [
      "in kleinen Familienunternehmen beschäftigt.",
      "ehrenamtlich für ein Bundesland tätig.",
      "selbstständig mit einer eigenen Firma tätig.",
      "bei einer Firma oder Behörde beschäftigt."
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-024",
    "text": "Wie viele Bundesländer hat die Bundesrepublik Deutschland?",
    "choices": [
      "14",
      "15",
      "16",
      "17"
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-025",
    "text": "Was ist kein Bundesland der Bundesrepublik Deutschland?",
    "choices": [
      "Elsass-Lothringen",
      "Nordrhein-Westfalen",
      "Mecklenburg-Vorpommern",
      "Sachsen-Anhalt"
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-026",
    "text": "Deutschland ist …",
    "choices": [
      "eine kommunistische Republik.",
      "ein demokratischer und sozialer Bundesstaat.",
      "eine kapitalistische und soziale Monarchie.",
      "ein sozialer und sozialistischer Bundesstaat."
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-027",
    "text": "Deutschland ist …",
    "choices": [
      "ein sozialistischer Staat.",
      "ein Bundesstaat.",
      "eine Diktatur.",
      "eine Monarchie."
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-028",
    "text": "Wer wählt in Deutschland die Abgeordneten zum Bundestag?",
    "choices": [
      "das Militär",
      "die Wirtschaft",
      "das wahlberechtigte Volk",
      "die Verwaltung"
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-029",
    "text": "Welches Tier ist das Wappentier der Bundesrepublik Deutschland?",
    "choices": [
      "Löwe",
      "Adler",
      "Bär",
      "Pferd"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-030",
    "text": "Was ist kein Merkmal unserer Demokratie?",
    "choices": [
      "regelmäßige Wahlen",
      "Pressezensur",
      "Meinungsfreiheit",
      "verschiedene Parteien"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-031",
    "text": "Die Zusammenarbeit von Parteien zur Bildung einer Regierung nennt man in Deutschland …",
    "choices": [
      "Einheit.",
      "Koalition.",
      "Ministerium.",
      "Fraktion."
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-032",
    "text": "Was ist keine staatliche Gewalt in Deutschland?",
    "choices": [
      "Gesetzgebung",
      "Regierung",
      "Presse",
      "Rechtsprechung"
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-033",
    "text": "Welche Aussage ist richtig? In Deutschland …",
    "choices": [
      "sind Staat und Religionsgemeinschaften voneinander getrennt.",
      "bilden die Religionsgemeinschaften den Staat.",
      "ist der Staat abhängig von den Religionsgemeinschaften.",
      "bilden Staat und Religionsgemeinschaften eine Einheit."
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-034",
    "text": "Was ist Deutschland nicht?",
    "choices": [
      "eine Demokratie",
      "ein Rechtsstaat",
      "eine Monarchie",
      "ein Sozialstaat"
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-035",
    "text": "Womit finanziert der deutsche Staat die Sozialversicherung?",
    "choices": [
      "Kirchensteuer",
      "Sozialabgaben",
      "Spendengeldern",
      "Vereinsbeiträgen"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-036",
    "text": "Welche Maßnahme schafft in Deutschland soziale Sicherheit?",
    "choices": [
      "die Krankenversicherung",
      "die Autoversicherung",
      "die Gebäudeversicherung",
      "die Haftpflichtversicherung"
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-037",
    "text": "Wie werden die Regierungschefinnen/Regierungschefs der meisten Bundesländer in Deutschland genannt?",
    "choices": [
      "Erste Ministerin/Erster Minister",
      "Premierministerin/Premierminister",
      "Senatorin/Senator",
      "Ministerpräsidentin/Ministerpräsident"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-038",
    "text": "Die Bundesrepublik Deutschland ist ein demokratischer und sozialer …",
    "choices": [
      "Staatenverbund.",
      "Bundesstaat.",
      "Staatenbund.",
      "Zentralstaat."
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-039",
    "text": "Was hat jedes deutsche Bundesland?",
    "choices": [
      "eine eigene Außenministerin/einen eigenen Außenminister",
      "eine eigene Währung",
      "eine eigene Armee",
      "eine eigene Regierung"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-040",
    "text": "Mit welchen Worten beginnt die deutsche Nationalhymne?",
    "choices": [
      "Völker, hört die Signale …",
      "Einigkeit und Recht und Freiheit …",
      "Freude schöner Götterfunken …",
      "Deutschland einig Vaterland …"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-041",
    "text": "Warum gibt es in einer Demokratie mehr als eine Partei?",
    "choices": [
      "weil dadurch die unterschiedlichen Meinungen der Bürgerinnen und Bürger vertreten werden",
      "damit Bestechung in der Politik begrenzt wird",
      "um politische Demonstrationen zu verhindern",
      "um wirtschaftlichen Wettbewerb anzuregen"
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-042",
    "text": "Wer beschließt in Deutschland ein neues Gesetz?",
    "choices": [
      "die Regierung",
      "das Parlament",
      "die Gerichte",
      "die Polizei"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-043",
    "text": "Wann kann in Deutschland eine Partei verboten werden?",
    "choices": [
      "wenn ihr Wahlkampf zu teuer ist",
      "wenn sie gegen die Verfassung kämpft",
      "wenn sie Kritik am Staatsoberhaupt äußert",
      "wenn ihr Programm eine neue Richtung vorschlägt"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": [
      "daten-jahre"
    ]
  },
  {
    "id": "gen-044",
    "text": "Wen kann man als Bürgerin/Bürger in Deutschland nicht direkt wählen?",
    "choices": [
      "Abgeordnete des EU-Parlaments",
      "Die Bundespräsidentin/den Bundespräsidenten",
      "Landtagsabgeordnete",
      "Bundestagsabgeordnete"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-045",
    "text": "Zu welcher Versicherung gehört die Pflegeversicherung?",
    "choices": [
      "Sozialversicherung",
      "Unfallversicherung",
      "Hausratsversicherung",
      "Haftpflicht- und Feuerversicherung"
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-046",
    "text": "Der deutsche Staat hat viele Aufgaben. Welche Aufgabe gehört dazu?",
    "choices": [
      "Er baut Straßen und Schulen.",
      "Er verkauft Lebensmittel und Kleidung.",
      "Er versorgt alle Einwohnerinnen und Einwohner kostenlos mit Zeitungen.",
      "Er produziert Autos und Busse."
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-047",
    "text": "Der deutsche Staat hat viele Aufgaben. Welche Aufgabe gehört nicht dazu?",
    "choices": [
      "Er bezahlt für alle Staatsangehörigen Urlaubsreisen.",
      "Er zahlt Kindergeld.",
      "Er unterstützt Museen.",
      "Er fördert Sportlerinnen und Sportler."
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-048",
    "text": "Welches Organ gehört nicht zu den Verfassungsorganen Deutschlands?",
    "choices": [
      "der Bundesrat",
      "die Bundespräsidentin/der Bundespräsident",
      "die Bürgerversammlung",
      "die Regierung"
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-049",
    "text": "Wer bestimmt in Deutschland die Schulpolitik?",
    "choices": [
      "die Lehrer und Lehrerinnen",
      "die Bundesländer",
      "das Familienministerium",
      "die Universitäten"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-050",
    "text": "Die Wirtschaftsform in Deutschland nennt man …",
    "choices": [
      "freie Zentralwirtschaft.",
      "soziale Marktwirtschaft.",
      "gelenkte Zentralwirtschaft.",
      "Planwirtschaft."
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-051",
    "text": "Zu einem demokratischen Rechtsstaat gehört es nicht, dass …",
    "choices": [
      "Menschen sich kritisch über die Regierung äußern können.",
      "Bürger friedlich demonstrieren gehen dürfen.",
      "Menschen von einer Privatpolizei ohne Grund verhaftet werden.",
      "jemand ein Verbrechen begeht und deshalb verhaftet wird."
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-052",
    "text": "Was bedeutet \"Volkssouveränität\"? Alle Staatsgewalt geht vom ...",
    "choices": [
      "Volke aus.",
      "Bundestag aus.",
      "preußischen König aus.",
      "Bundesverfassungsgericht aus."
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-053",
    "text": "Was bedeutet \"Rechtsstaat\" in Deutschland?",
    "choices": [
      "Der Staat hat Recht.",
      "Es gibt nur rechte Parteien.",
      "Die Bürgerinnen und Bürger entscheiden über Gesetze.",
      "Der Staat muss die Gesetze einhalten."
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-054",
    "text": "Was ist keine staatliche Gewalt in Deutschland?",
    "choices": [
      "Legislative",
      "Judikative",
      "Exekutive",
      "Direktive"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-055",
    "text": "Was zeigt dieses Bild?",
    "choices": [
      "den Bundestagssitz in Berlin",
      "das Bundesverfassungsgericht in Karlsruhe",
      "das Bundesratsgebäude in Berlin",
      "das Bundeskanzleramt in Berlin"
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ],
    "imageOnly": true,
    "image": "images/reichstag.jpg"
  },
  {
    "id": "gen-056",
    "text": "Welches Amt gehört in Deutschland zur Gemeindeverwaltung?",
    "choices": [
      "Pfarramt",
      "Ordnungsamt",
      "Finanzamt",
      "Auswärtiges Amt"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-057",
    "text": "Wer wird meistens zur Präsidentin/zum Präsidenten des Deutschen Bundestages gewählt?",
    "choices": [
      "die/der älteste Abgeordnete im Parlament",
      "die Ministerpräsidentin/der Ministerpräsident des größten Bundeslandes",
      "eine ehemalige Bundeskanzlerin/ein ehemaliger Bundeskanzler",
      "eine Abgeordnete/ein Abgeordneter der stärksten Fraktion"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-058",
    "text": "Wer ernennt in Deutschland die Ministerinnen/die Minister der Bundesregierung?",
    "choices": [
      "die Präsidentin/der Präsident des Bundesverfassungsgerichtes",
      "die Bundespräsidentin/der Bundespräsident",
      "die Bundesratspräsidentin/der Bundesratspräsident",
      "die Bundestagspräsidentin/der Bundestagspräsident"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-059",
    "text": "Vor wie vielen Jahren gab es erstmals eine jüdische Gemeinde auf dem Gebiet des heutigen Deutschlands?",
    "choices": [
      "vor etwa 300 Jahren",
      "vor etwa 700 Jahren",
      "vor etwa 1150 Jahren",
      "vor etwa 1700 Jahren"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": [
      "daten-jahre"
    ]
  },
  {
    "id": "gen-060",
    "text": "In Deutschland gehören der Bundestag und der Bundesrat zur …",
    "choices": [
      "Exekutive.",
      "Legislative.",
      "Direktive.",
      "Judikative."
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-061",
    "text": "Was bedeutet \"Volkssouveränität\"?",
    "choices": [
      "Die Königin/der König herrscht über das Volk.",
      "Das Bundesverfassungsgericht steht über der Verfassung.",
      "Die Interessenverbände üben die Souveränität zusammen mit der Regierung aus.",
      "Die Staatsgewalt geht vom Volke aus."
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-062",
    "text": "Wenn das Parlament eines deutschen Bundeslandes gewählt wird, nennt man das …",
    "choices": [
      "Kommunalwahl",
      "Landtagswahl",
      "Europawahl",
      "Bundestagswahl"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-063",
    "text": "Was gehört in Deutschland nicht zur Exekutive?",
    "choices": [
      "die Polizei",
      "die Gerichte",
      "das Finanzamt",
      "die Ministerien"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-064",
    "text": "Die Bundesrepublik Deutschland ist heute gegliedert in …",
    "choices": [
      "vier Besatzungszonen.",
      "einen Oststaat und einen Weststaat.",
      "16 Kantone.",
      "Bund, Länder und Kommunen."
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-065",
    "text": "Es gehört nicht zu den Aufgaben des Deutschen Bundestages, …",
    "choices": [
      "Gesetze zu entwerfen.",
      "die Bundesregierung zu kontrollieren.",
      "die Bundeskanzlerin/den Bundeskanzler zu wählen.",
      "das Bundeskabinett zu bilden."
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-066",
    "text": "Welche Städte haben die größten jüdischen Gemeinden in Deutschland?",
    "choices": [
      "Berlin und München",
      "Hamburg und Essen",
      "Nürnberg und Stuttgart",
      "Worms und Speyer"
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-067",
    "text": "Was ist in Deutschland vor allem eine Aufgabe der Bundesländer?",
    "choices": [
      "Verteidigungspolitik",
      "Außenpolitik",
      "Wirtschaftspolitik",
      "Schulpolitik"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-068",
    "text": "Warum kontrolliert der Staat in Deutschland das Schulwesen?",
    "choices": [
      "weil es in Deutschland nur staatliche Schulen gibt",
      "weil alle Schülerinnen und Schüler einen Schulabschluss haben müssen",
      "weil es in den Bundesländern verschiedene Schulen gibt",
      "weil es nach dem Grundgesetz seine Aufgabe ist"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-069",
    "text": "Die Bundesrepublik Deutschland hat einen dreistufigen Verwaltungsaufbau. Wie heißt die unterste politische Stufe?",
    "choices": [
      "Stadträte",
      "Landräte",
      "Gemeinden",
      "Bezirksämter"
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-070",
    "text": "Der deutsche Bundespräsident Gustav Heinemann gibt Helmut Schmidt 1974 die Ernennungsurkunde zum deutschen Bundeskanzler. Was gehört zu den Aufgaben der deutschen Bundespräsidentin/des deutschen Bundespräsidenten?",
    "choices": [
      "Sie/Er führt die Regierungsgeschäfte.",
      "Sie/Er kontrolliert die Regierungspartei.",
      "Sie/Er wählt die Ministerinnen/Minister aus.",
      "Sie/Er schlägt die Kanzlerin/den Kanzler zur Wahl vor."
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": [
      "staatsorgane",
      "daten-jahre"
    ]
  },
  {
    "id": "gen-071",
    "text": "Wo hält sich die deutsche Bundeskanzlerin/der deutsche Bundeskanzler am häufigsten auf? Am häufigsten ist sie/er …",
    "choices": [
      "in Bonn, weil sich dort das Bundeskanzleramt und der Bundestag befinden.",
      "auf Schloss Meseberg, dem Gästehaus der Bundesregierung, um Staatsgäste zu empfangen.",
      "auf Schloss Bellevue, dem Amtssitz der Bundespräsidentin/des Bundespräsidenten, um Staatsgäste zu empfangen.",
      "in Berlin, weil sich dort das Bundeskanzleramt und der Bundestag befinden."
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-072",
    "text": "Wie heißt die jetzige Bundeskanzlerin/der jetzige Bundeskanzler von Deutschland?",
    "choices": [
      "Gerhard Schröder",
      "Angela Merkel",
      "Ursula von der Leyen",
      "Friedrich Merz"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-073",
    "text": "Die beiden größten Fraktionen im Deutschen Bundestag heißen zurzeit …",
    "choices": [
      "CDU/CSU und AfD.",
      "Die Linke und Bündnis 90/Die Grünen.",
      "Bündnis 90/Die Grünen und SPD.",
      "Die Linke und CDU/CSU."
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-074",
    "text": "Wie heißt das Parlament für ganz Deutschland?",
    "choices": [
      "Bundesversammlung",
      "Volkskammer",
      "Bundestag",
      "Bundesgerichtshof"
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-075",
    "text": "Wie heißt Deutschlands heutiges Staatsoberhaupt?",
    "choices": [
      "Frank-Walter Steinmeier",
      "Bärbel Bas",
      "Bodo Ramelow",
      "Joachim Gauck"
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-076",
    "text": "Was bedeutet die Abkürzung CDU in Deutschland?",
    "choices": [
      "Christliche Deutsche Union",
      "Club Deutscher Unternehmer",
      "Christlicher Deutscher Umweltschutz",
      "Christlich Demokratische Union"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-077",
    "text": "Was ist die Bundeswehr?",
    "choices": [
      "die deutsche Polizei",
      "ein deutscher Hafen",
      "eine deutsche Bürgerinitiative",
      "die deutsche Armee"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-078",
    "text": "Was bedeutet die Abkürzung SPD?",
    "choices": [
      "Sozialistische Partei Deutschlands",
      "Sozialpolitische Partei Deutschlands",
      "Sozialdemokratische Partei Deutschlands",
      "Sozialgerechte Partei Deutschlands"
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-079",
    "text": "Was bedeutet die Abkürzung FDP in Deutschland?",
    "choices": [
      "Friedliche Demonstrative Partei",
      "Freie Deutschland Partei",
      "Führende Demokratische Partei",
      "Freie Demokratische Partei"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-080",
    "text": "Welches Gericht in Deutschland ist zuständig für die Auslegung des Grundgesetzes?",
    "choices": [
      "Oberlandesgericht",
      "Amtsgericht",
      "Bundesverfassungsgericht",
      "Verwaltungsgericht"
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-081",
    "text": "Wer wählt die Bundeskanzlerin/den Bundeskanzler in Deutschland?",
    "choices": [
      "der Bundesrat",
      "die Bundesversammlung",
      "das Volk",
      "der Bundestag"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-082",
    "text": "Wer leitet das deutsche Bundeskabinett?",
    "choices": [
      "die Bundestagspräsidentin/der Bundestagspräsident",
      "die Bundespräsidentin/der Bundespräsident",
      "die Bundesratspräsidentin/der Bundesratspräsident",
      "die Bundeskanzlerin/der Bundeskanzler"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-083",
    "text": "Wer wählt die deutsche Bundeskanzlerin/den deutschen Bundeskanzler?",
    "choices": [
      "das Volk",
      "die Bundesversammlung",
      "der Bundestag",
      "die Bundesregierung"
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-084",
    "text": "Welche Hauptaufgabe hat die deutsche Bundespräsidentin/der deutsche Bundespräsident? Sie/Er …",
    "choices": [
      "regiert das Land.",
      "entwirft die Gesetze.",
      "repräsentiert das Land.",
      "überwacht die Einhaltung der Gesetze."
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-085",
    "text": "Wer bildet den deutschen Bundesrat?",
    "choices": [
      "die Abgeordneten des Bundestages",
      "die Ministerinnen und Minister der Bundesregierung",
      "die Regierungsvertreter der Bundesländer",
      "die Parteimitglieder"
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-086",
    "text": "Wer wählt in Deutschland die Bundespräsidentin/den Bundespräsidenten?",
    "choices": [
      "die Bundesversammlung",
      "der Bundesrat",
      "das Bundesparlament",
      "das Bundesverfassungsgericht"
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-087",
    "text": "Wer ist das Staatsoberhaupt der Bundesrepublik Deutschland?",
    "choices": [
      "die Bundeskanzlerin/der Bundeskanzler",
      "die Bundespräsidentin/der Bundespräsident",
      "die Bundesratspräsidentin/der Bundesratspräsident",
      "die Bundestagspräsidentin/der Bundestagspräsident"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-088",
    "text": "Die parlamentarische Opposition im Deutschen Bundestag …",
    "choices": [
      "kontrolliert die Regierung.",
      "entscheidet, wer Bundesministerin/Bundesminister wird.",
      "bestimmt, wer im Bundesrat sitzt.",
      "schlägt die Regierungschefinnen/Regierungschefs der Länder vor."
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-089",
    "text": "Wie nennt man in Deutschland die Vereinigung von Abgeordneten einer Partei im Parlament?",
    "choices": [
      "Verband",
      "Ältestenrat",
      "Fraktion",
      "Opposition"
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-090",
    "text": "Die deutschen Bundesländer wirken an der Gesetzgebung des Bundes mit durch …",
    "choices": [
      "den Bundesrat.",
      "die Bundesversammlung.",
      "den Bundestag.",
      "die Bundesregierung."
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-091",
    "text": "In Deutschland kann ein Regierungswechsel in einem Bundesland Auswirkungen auf die Bundespolitik haben. Das Regieren wird …",
    "choices": [
      "schwieriger, wenn sich dadurch die Mehrheit im Bundestag ändert.",
      "leichter, wenn dadurch neue Parteien in den Bundesrat kommen.",
      "schwieriger, wenn dadurch die Mehrheit im Bundesrat verändert wird.",
      "leichter, wenn es sich um ein reiches Bundesland handelt."
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-092",
    "text": "Was bedeutet die Abkürzung CSU in Deutschland?",
    "choices": [
      "Christlich Sichere Union",
      "Christlich Süddeutsche Union",
      "Christlich Sozialer Unternehmerverband",
      "Christlich Soziale Union"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-093",
    "text": "Je mehr \"Zweitstimmen\" eine Partei bei einer Bundestagswahl bekommt, desto …",
    "choices": [
      "weniger Erststimmen kann sie haben.",
      "mehr Direktkandidaten der Partei ziehen ins Parlament ein.",
      "größer ist das Risiko, eine Koalition bilden zu müssen.",
      "mehr Sitze erhält die Partei im Parlament."
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-094",
    "text": "Ab welchem Alter darf man in Deutschland an der Wahl zum Deutschen Bundestag teilnehmen?",
    "choices": [
      "16",
      "18",
      "21",
      "23"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-095",
    "text": "Was gilt für die meisten Kinder in Deutschland?",
    "choices": [
      "Wahlpflicht",
      "Schulpflicht",
      "Schweigepflicht",
      "Religionspflicht"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-096",
    "text": "Wie kann jemand, der den Holocaust leugnet, bestraft werden?",
    "choices": [
      "Kürzung sozialer Leistungen",
      "bis zu 100 Sozialstunden",
      "gar nicht, Holocaustleugnung ist erlaubt",
      "mit Freiheitsstrafe bis zu fünf Jahren oder mit Geldstrafe"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-097",
    "text": "Was bezahlt man in Deutschland automatisch, wenn man fest angestellt ist?",
    "choices": [
      "Sozialversicherung",
      "Sozialhilfe",
      "Kindergeld",
      "Wohngeld"
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-098",
    "text": "Wenn Abgeordnete im Deutschen Bundestag ihre Fraktion wechseln, …",
    "choices": [
      "dürfen sie nicht mehr an den Sitzungen des Parlaments teilnehmen.",
      "kann die Regierung ihre Mehrheit verlieren.",
      "muss die Bundespräsidentin/der Bundespräsident zuvor ihr/sein Einverständnis geben.",
      "dürfen die Wählerinnen/Wähler dieser Abgeordneten noch einmal wählen."
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-099",
    "text": "Wer bezahlt in Deutschland die Sozialversicherungen?",
    "choices": [
      "Arbeitgeberinnen/Arbeitgeber und Arbeitnehmerinnen/Arbeitnehmer",
      "nur Arbeitnehmerinnen/Arbeitnehmer",
      "alle Staatsangehörigen",
      "nur Arbeitgeberinnen/Arbeitgeber"
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-100",
    "text": "Was gehört nicht zur gesetzlichen Sozialversicherung?",
    "choices": [
      "die Lebensversicherung",
      "die gesetzliche Rentenversicherung",
      "die Arbeitslosenversicherung",
      "die Pflegeversicherung"
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-101",
    "text": "Gewerkschaften sind Interessenverbände der …",
    "choices": [
      "Jugendlichen.",
      "Arbeitnehmerinnen und Arbeitnehmer.",
      "Rentnerinnen und Rentner.",
      "Arbeitgeberinnen und Arbeitgeber."
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-102",
    "text": "Womit kann man in der Bundesrepublik Deutschland geehrt werden, wenn man auf politischem, wirtschaftlichem, kulturellem, geistigem oder sozialem Gebiet eine besondere Leistung erbracht hat? Mit dem …",
    "choices": [
      "Bundesverdienstkreuz",
      "Bundesadler",
      "Vaterländischen Verdienstorden",
      "Ehrentitel \"Held der Deutschen Demokratischen Republik\""
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-103",
    "text": "Was wird in Deutschland als \"Ampelkoalition\" bezeichnet? Die Zusammenarbeit …",
    "choices": [
      "der Bundestagsfraktionen von CDU und CSU",
      "von SPD, FDP und Bündnis 90/Die Grünen in einer Regierung",
      "von CSU, Die LINKE und Bündnis 90/Die Grünen in einer Regierung",
      "der Bundestagsfraktionen von CDU und SPD"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-104",
    "text": "Eine Frau in Deutschland verliert ihre Arbeit. Was darf nicht der Grund für diese Entlassung sein?",
    "choices": [
      "Die Frau ist lange krank und arbeitsunfähig.",
      "Die Frau kam oft zu spät zur Arbeit.",
      "Die Frau erledigt private Sachen während der Arbeitszeit.",
      "Die Frau bekommt ein Kind und ihr Chef weiß das."
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-105",
    "text": "Was ist eine Aufgabe von Wahlhelferinnen/Wahlhelfern in Deutschland?",
    "choices": [
      "Sie helfen alten Menschen bei der Stimmabgabe in der Wahlkabine.",
      "Sie schreiben die Wahlbenachrichtigungen vor der Wahl.",
      "Sie geben Zwischenergebnisse an die Medien weiter.",
      "Sie zählen die Stimmen nach dem Ende der Wahl."
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-106",
    "text": "In Deutschland helfen ehrenamtliche Wahlhelferinnen und Wahlhelfer bei den Wahlen. Was ist eine Aufgabe von Wahlhelferinnen/Wahlhelfern?",
    "choices": [
      "Sie helfen Kindern und alten Menschen beim Wählen.",
      "Sie schreiben Karten und Briefe mit der Angabe des Wahllokals.",
      "Sie geben Zwischenergebnisse an Journalisten weiter.",
      "Sie zählen die Stimmen nach dem Ende der Wahl."
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-107",
    "text": "Für wie viele Jahre wird der Bundestag in Deutschland gewählt?",
    "choices": [
      "2 Jahre",
      "4 Jahre",
      "6 Jahre",
      "8 Jahre"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-108",
    "text": "Bei einer Bundestagswahl in Deutschland darf jede/jeder wählen, die/der …",
    "choices": [
      "in der Bundesrepublik Deutschland wohnt und wählen möchte.",
      "Bürgerin/Bürger der Bundesrepublik Deutschland ist und mindestens 18 Jahre alt ist.",
      "seit mindestens 3 Jahren in der Bundesrepublik Deutschland lebt.",
      "Bürgerin/Bürger der Bundesrepublik Deutschland ist und mindestens 21 Jahre alt ist."
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": [
      "staatsorgane",
      "daten-jahre"
    ]
  },
  {
    "id": "gen-109",
    "text": "Wie oft gibt es normalerweise Bundestagswahlen in Deutschland?",
    "choices": [
      "alle drei Jahre",
      "alle vier Jahre",
      "alle fünf Jahre",
      "alle sechs Jahre"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-110",
    "text": "Für wie viele Jahre wird der Bundestag in Deutschland gewählt?",
    "choices": [
      "2 Jahre",
      "3 Jahre",
      "4 Jahre",
      "5 Jahre"
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-111",
    "text": "Welche Handlungen mit Bezug auf den Staat Israel sind in Deutschland verboten?",
    "choices": [
      "die Politik Israels öffentlich kritisieren",
      "das Aufhängen einer israelischen Flagge auf dem Privatgrundstück",
      "eine Diskussion über die Politik Israels",
      "der öffentliche Aufruf zur Vernichtung Israels"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-112",
    "text": "Die Wahlen in Deutschland sind …",
    "choices": [
      "speziell.",
      "geheim.",
      "berufsbezogen.",
      "geschlechtsabhängig."
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-113",
    "text": "Wahlen in Deutschland gewinnt die Partei, die …",
    "choices": [
      "die meisten Stimmen bekommt.",
      "die meisten Männer mehrheitlich gewählt haben.",
      "die meisten Stimmen bei den Arbeiterinnen/Arbeitern bekommen hat.",
      "die meisten Erststimmen für ihre Kanzlerkandidatin/ihren Kanzlerkandidaten erhalten hat."
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-114",
    "text": "An demokratischen Wahlen in Deutschland teilzunehmen ist …",
    "choices": [
      "eine Pflicht.",
      "ein Recht.",
      "ein Zwang.",
      "eine Last."
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-115",
    "text": "Was bedeutet \"aktives Wahlrecht\" in Deutschland?",
    "choices": [
      "Man kann gewählt werden.",
      "Man muss wählen gehen.",
      "Man kann wählen.",
      "Man muss zur Auszählung der Stimmen gehen."
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-116",
    "text": "Wenn Sie bei einer Bundestagswahl in Deutschland wählen dürfen, heißt das …",
    "choices": [
      "aktive Wahlkampagne.",
      "aktives Wahlverfahren.",
      "aktiver Wahlkampf.",
      "aktives Wahlrecht."
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-117",
    "text": "Wie viel Prozent der Zweitstimmen müssen Parteien mindestens bekommen, um in den Deutschen Bundestag gewählt zu werden?",
    "choices": [
      "3%",
      "4%",
      "5%",
      "6%"
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-118",
    "text": "Wer darf bei den rund 40 jüdischen Makkabi-Sportvereinen Mitglied werden?",
    "choices": [
      "nur Deutsche",
      "nur Israelis",
      "nur religiöse Menschen",
      "alle Menschen"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-119",
    "text": "Wahlen in Deutschland sind frei. Was bedeutet das?",
    "choices": [
      "Alle verurteilten Straftäterinnen/Straftäter dürfen nicht wählen.",
      "Wenn ich wählen gehen möchte, muss meine Arbeitgeberin/mein Arbeitgeber mir frei geben.",
      "Jede Person kann ohne Zwang entscheiden, ob sie wählen möchte und wen sie wählen möchte.",
      "Ich kann frei entscheiden, wo ich wählen gehen möchte."
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-120",
    "text": "Das Wahlsystem in Deutschland ist ein …",
    "choices": [
      "Zensuswahlrecht.",
      "Dreiklassenwahlrecht.",
      "Mehrheits- und Verhältniswahlrecht.",
      "allgemeines Männerwahlrecht."
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-121",
    "text": "Eine Partei möchte in den Deutschen Bundestag. Sie muss aber einen Mindestanteil an Wählerstimmen haben. Das heißt …",
    "choices": [
      "5%-Hürde.",
      "Zulassungsgrenze.",
      "Basiswert.",
      "Richtlinie."
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-122",
    "text": "Welchem Grundsatz unterliegen Wahlen in Deutschland? Wahlen in Deutschland sind …",
    "choices": [
      "frei, gleich, geheim.",
      "offen, sicher, frei.",
      "geschlossen, gleich, sicher.",
      "sicher, offen, freiwillig."
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-123",
    "text": "Was ist in Deutschland die \"5%-Hürde\"?",
    "choices": [
      "Abstimmungsregelung im Bundestag für kleine Parteien",
      "Anwesenheitskontrolle im Bundestag für Abstimmungen",
      "Mindestanteil an Wählerstimmen, um ins Parlament zu kommen",
      "Anwesenheitskontrolle im Bundesrat für Abstimmungen"
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-124",
    "text": "Die Bundestagswahl in Deutschland ist die Wahl …",
    "choices": [
      "der Bundeskanzlerin/des Bundeskanzlers.",
      "der Parlamente der Länder.",
      "des Parlaments für Deutschland.",
      "der Bundespräsidentin/des Bundespräsidenten."
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-125",
    "text": "In einer Demokratie ist eine Funktion von regelmäßigen Wahlen, …",
    "choices": [
      "die Bürgerinnen und Bürger zu zwingen, ihre Stimme abzugeben.",
      "nach dem Willen der Wählermehrheit den Wechsel der Regierung zu ermöglichen.",
      "im Land bestehende Gesetze beizubehalten.",
      "den Armen mehr Macht zu geben."
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-126",
    "text": "Was bekommen wahlberechtigte Bürgerinnen und Bürger in Deutschland vor einer Wahl?",
    "choices": [
      "eine Wahlbenachrichtigung von der Gemeinde",
      "eine Wahlerlaubnis von der Bundespräsidentin/von dem Bundespräsidenten",
      "eine Benachrichtigung von der Bundesversammlung",
      "eine Benachrichtigung vom Pfarramt"
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-127",
    "text": "Warum gibt es die 5%-Hürde im Wahlgesetz der Bundesrepublik Deutschland? Es gibt sie, weil …",
    "choices": [
      "die Programme von vielen kleinen Parteien viele Gemeinsamkeiten haben.",
      "die Bürgerinnen und Bürger bei vielen kleinen Parteien die Orientierung verlieren können.",
      "viele kleine Parteien die Regierungsbildung erschweren.",
      "die kleinen Parteien nicht so viel Geld haben, um die Politikerinnen und Politiker zu bezahlen."
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-128",
    "text": "Parlamentsmitglieder, die von den Bürgerinnen und Bürgern gewählt werden, nennt man …",
    "choices": [
      "Abgeordnete.",
      "Kanzlerinnen/Kanzler.",
      "Botschafterinnen/Botschafter.",
      "Ministerpräsidentinnen/Ministerpräsidenten."
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-129",
    "text": "Vom Volk gewählt wird in Deutschland …",
    "choices": [
      "die Bundeskanzlerin/der Bundeskanzler.",
      "die Ministerpräsidentin/der Ministerpräsident eines Bundeslandes.",
      "der Bundestag.",
      "die Bundespräsidentin/der Bundespräsident."
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-130",
    "text": "Welcher Stimmzettel wäre bei einer Bundestagswahl gültig?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ],
    "imageOnly": true
  },
  {
    "id": "gen-131",
    "text": "In Deutschland ist eine Bürgermeisterin/ein Bürgermeister …",
    "choices": [
      "die Leiterin/der Leiter einer Schule.",
      "die Chefin/der Chef einer Bank.",
      "das Oberhaupt einer Gemeinde.",
      "die/der Vorsitzende einer Partei."
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-132",
    "text": "Viele Menschen in Deutschland arbeiten in ihrer Freizeit ehrenamtlich. Was bedeutet das?",
    "choices": [
      "Sie arbeiten als Soldatinnen/Soldaten.",
      "Sie arbeiten freiwillig und unbezahlt in Vereinen und Verbänden.",
      "Sie arbeiten in der Bundesregierung.",
      "Sie arbeiten in einem Krankenhaus und verdienen dabei Geld."
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-133",
    "text": "Was ist bei Bundestags- und Landtagswahlen in Deutschland erlaubt?",
    "choices": [
      "Der Ehemann wählt für seine Frau mit.",
      "Man kann durch Briefwahl seine Stimme abgeben.",
      "Man kann am Wahltag telefonisch seine Stimme abgeben.",
      "Kinder ab dem Alter von 14 Jahren dürfen wählen."
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-134",
    "text": "Man will die Buslinie abschaffen, mit der Sie immer zur Arbeit fahren. Was können Sie machen, um die Buslinie zu erhalten?",
    "choices": [
      "Ich beteilige mich an einer Bürgerinitiative für die Erhaltung der Buslinie oder gründe selber eine Initiative.",
      "Ich werde Mitglied in einem Sportverein und trainiere Radfahren.",
      "Ich wende mich an das Finanzamt, weil ich als Steuerzahlerin/Steuerzahler ein Recht auf die Buslinie habe.",
      "Ich schreibe einen Brief an das Forstamt der Gemeinde."
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-135",
    "text": "Wen vertreten die Gewerkschaften in Deutschland?",
    "choices": [
      "große Unternehmen",
      "kleine Unternehmen",
      "Selbstständige",
      "Arbeitnehmerinnen und Arbeitnehmer"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-136",
    "text": "Sie gehen in Deutschland zum Arbeitsgericht bei …",
    "choices": [
      "falscher Nebenkostenabrechnung.",
      "ungerechtfertigter Kündigung durch Ihre Chefin/Ihren Chef.",
      "Problemen mit den Nachbarinnen/Nachbarn.",
      "Schwierigkeiten nach einem Verkehrsunfall."
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-137",
    "text": "Welches Gericht ist in Deutschland bei Konflikten in der Arbeitswelt zuständig?",
    "choices": [
      "das Familiengericht",
      "das Strafgericht",
      "das Arbeitsgericht",
      "das Amtsgericht"
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-138",
    "text": "Was kann ich in Deutschland machen, wenn mir meine Arbeitgeberin/mein Arbeitgeber zu Unrecht gekündigt hat?",
    "choices": [
      "weiterarbeiten und freundlich zur Chefin/zum Chef sein",
      "ein Mahnverfahren gegen die Arbeitgeberin/den Arbeitgeber führen",
      "Kündigungsschutzklage erheben",
      "die Arbeitgeberin/den Arbeitgeber bei der Polizei anzeigen"
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-139",
    "text": "Wann kommt es in Deutschland zu einem Prozess vor Gericht? Wenn jemand …",
    "choices": [
      "zu einer anderen Religion übertritt.",
      "eine Straftat begangen hat und angeklagt wird.",
      "eine andere Meinung als die der Regierung vertritt.",
      "sein Auto falsch geparkt hat und es abgeschleppt wird."
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": [
      "daten-jahre"
    ]
  },
  {
    "id": "gen-140",
    "text": "Was macht eine Schöffin/ein Schöffe in Deutschland? Sie/Er …",
    "choices": [
      "entscheidet mit Richterinnen/Richtern über Schuld und Strafe.",
      "gibt Bürgerinnen/Bürgern rechtlichen Rat.",
      "stellt Urkunden aus.",
      "verteidigt die Angeklagte/den Angeklagten."
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-141",
    "text": "Wer berät in Deutschland Personen bei Rechtsfragen und vertritt sie vor Gericht?",
    "choices": [
      "eine Rechtsanwältin/ein Rechtsanwalt",
      "eine Richterin/ein Richter",
      "eine Schöffin/ein Schöffe",
      "eine Staatsanwältin/ein Staatsanwalt"
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-142",
    "text": "Was ist die Hauptaufgabe einer Richterin/eines Richters in Deutschland? Eine Richterin/ein Richter …",
    "choices": [
      "vertritt Bürgerinnen und Bürger vor einem Gericht.",
      "arbeitet an einem Gericht und spricht Urteile.",
      "ändert Gesetze.",
      "betreut Jugendliche vor Gericht."
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-143",
    "text": "Eine Richterin/ein Richter in Deutschland gehört zur …",
    "choices": [
      "Judikative.",
      "Exekutive.",
      "Operative.",
      "Legislative."
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-144",
    "text": "Eine Richterin/ein Richter gehört in Deutschland zur …",
    "choices": [
      "vollziehenden Gewalt.",
      "rechtsprechenden Gewalt.",
      "planenden Gewalt.",
      "gesetzgebenden Gewalt."
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-145",
    "text": "In Deutschland wird die Staatsgewalt geteilt. Für welche Staatsgewalt arbeitet eine Richterin/ein Richter? Für die …",
    "choices": [
      "Judikative",
      "Exekutive",
      "Presse",
      "Legislative"
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-146",
    "text": "Wie nennt man in Deutschland ein Verfahren vor einem Gericht?",
    "choices": [
      "Programm",
      "Prozedur",
      "Protokoll",
      "Prozess"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-147",
    "text": "Was ist die Arbeit einer Richterin/eines Richters in Deutschland?",
    "choices": [
      "Deutschland regieren",
      "Recht sprechen",
      "Pläne erstellen",
      "Gesetze erlassen"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-148",
    "text": "Was ist eine Aufgabe der Polizei in Deutschland?",
    "choices": [
      "das Land zu verteidigen",
      "die Bürgerinnen und Bürger abzuhören",
      "die Gesetze zu beschließen",
      "die Einhaltung von Gesetzen zu überwachen"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-149",
    "text": "Was ist ein Beispiel für antisemitisches Verhalten?",
    "choices": [
      "ein jüdisches Fest besuchen",
      "die israelische Regierung kritisieren",
      "den Holocaust leugnen",
      "gegen Juden Fußball spielen."
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-150",
    "text": "Eine Gerichtsschöffin/ein Gerichtsschöffe in Deutschland ist …",
    "choices": [
      "die Stellvertreterin/der Stellvertreter des Stadtoberhaupts.",
      "eine ehrenamtliche Richterin/ein ehrenamtlicher Richter.",
      "ein Mitglied eines Gemeinderats.",
      "eine Person, die Jura studiert hat."
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-151",
    "text": "Wer baute die Mauer in Berlin?",
    "choices": [
      "Großbritannien",
      "die DDR",
      "die Bundesrepublik Deutschland",
      "die USA"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-152",
    "text": "Wann waren die Nationalsozialisten mit Adolf Hitler in Deutschland an der Macht?",
    "choices": [
      "1918 bis 1923",
      "1932 bis 1950",
      "1933 bis 1945",
      "1945 bis 1989"
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": [
      "daten-jahre"
    ]
  },
  {
    "id": "gen-153",
    "text": "Was war am 8. Mai 1945?",
    "choices": [
      "Tod Adolf Hitlers",
      "Beginn des Berliner Mauerbaus",
      "Wahl von Konrad Adenauer zum Bundeskanzler",
      "Ende des Zweiten Weltkriegs in Europa"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": [
      "staatsorgane",
      "daten-jahre"
    ]
  },
  {
    "id": "gen-154",
    "text": "Wann war der Zweite Weltkrieg zu Ende?",
    "choices": [
      "1933",
      "1945",
      "1949",
      "1961"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": [
      "daten-jahre"
    ]
  },
  {
    "id": "gen-155",
    "text": "Wann waren die Nationalsozialisten in Deutschland an der Macht?",
    "choices": [
      "1888 bis 1918",
      "1921 bis 1934",
      "1933 bis 1945",
      "1949 bis 1963"
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": [
      "daten-jahre"
    ]
  },
  {
    "id": "gen-156",
    "text": "In welchem Jahr wurde Hitler Reichskanzler?",
    "choices": [
      "1923",
      "1927",
      "1933",
      "1936"
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": [
      "daten-jahre"
    ]
  },
  {
    "id": "gen-157",
    "text": "Die Nationalsozialisten mit Adolf Hitler errichteten 1933 in Deutschland …",
    "choices": [
      "eine Diktatur.",
      "einen demokratischen Staat.",
      "eine Monarchie.",
      "ein Fürstentum."
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": [
      "daten-jahre"
    ]
  },
  {
    "id": "gen-158",
    "text": "Das \"Dritte Reich\" war eine …",
    "choices": [
      "Diktatur.",
      "Demokratie.",
      "Monarchie.",
      "Räterepublik."
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-159",
    "text": "Was gab es in Deutschland nicht während der Zeit des Nationalsozialismus?",
    "choices": [
      "freie Wahlen",
      "Pressezensur",
      "willkürliche Verhaftungen",
      "Verfolgung von Juden"
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-160",
    "text": "Welcher Krieg dauerte von 1939 bis 1945?",
    "choices": [
      "der Erste Weltkrieg",
      "der Zweite Weltkrieg",
      "der Vietnamkrieg",
      "der Golfkrieg"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": [
      "daten-jahre"
    ]
  },
  {
    "id": "gen-161",
    "text": "Was kennzeichnete den NS-Staat? Eine Politik …",
    "choices": [
      "des staatlichen Rassismus",
      "der Meinungsfreiheit",
      "der allgemeinen Religionsfreiheit",
      "der Entwicklung der Demokratie"
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-162",
    "text": "Claus Schenk Graf von Stauffenberg wurde bekannt durch …",
    "choices": [
      "eine Goldmedaille bei den Olympischen Spielen 1936.",
      "den Bau des Reichstagsgebäudes.",
      "den Aufbau der Wehrmacht.",
      "das Attentat auf Hitler am 20. Juli 1944."
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": [
      "daten-jahre"
    ]
  },
  {
    "id": "gen-163",
    "text": "In welchem Jahr zerstörten die Nationalsozialisten Synagogen und jüdische Geschäfte in Deutschland?",
    "choices": [
      "1925",
      "1930",
      "1938",
      "1945"
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": [
      "daten-jahre"
    ]
  },
  {
    "id": "gen-164",
    "text": "Was passierte am 9. November 1938 in Deutschland?",
    "choices": [
      "Mit dem Angriff auf Polen beginnt der Zweite Weltkrieg.",
      "Die Nationalsozialisten verlieren eine Wahl und lösen den Reichstag auf.",
      "Jüdische Geschäfte und Synagogen werden durch Nationalsozialisten und ihre Anhänger zerstört.",
      "Hitler wird Reichspräsident und lässt alle Parteien verbieten."
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": [
      "daten-jahre"
    ]
  },
  {
    "id": "gen-165",
    "text": "Wie hieß der erste Bundeskanzler der Bundesrepublik Deutschland?",
    "choices": [
      "Konrad Adenauer",
      "Kurt Georg Kiesinger",
      "Helmut Schmidt",
      "Willy Brandt"
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-166",
    "text": "Bei welchen Demonstrationen in Deutschland riefen die Menschen \"Wir sind das Volk\"?",
    "choices": [
      "beim Arbeiteraufstand 1953 in der DDR",
      "bei den Demonstrationen 1968 in der Bundesrepublik Deutschland",
      "bei den Anti-Atomkraft-Demonstrationen 1985 in der Bundesrepublik Deutschland",
      "bei den Montagsdemonstrationen 1989 in der DDR"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": [
      "daten-jahre"
    ]
  },
  {
    "id": "gen-167",
    "text": "Welche Länder wurden nach dem Zweiten Weltkrieg in Deutschland als \"Alliierte Besatzungsmächte\" bezeichnet?",
    "choices": [
      "Sowjetunion, Großbritannien, Polen, Schweden",
      "Frankreich, Sowjetunion, Italien, Japan",
      "USA, Sowjetunion, Spanien, Portugal",
      "USA, Sowjetunion, Großbritannien, Frankreich"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-168",
    "text": "Welches Land war keine \"Alliierte Besatzungsmacht\" in Deutschland?",
    "choices": [
      "USA",
      "Sowjetunion",
      "Frankreich",
      "Japan"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-169",
    "text": "Wann wurde die Bundesrepublik Deutschland gegründet?",
    "choices": [
      "1939",
      "1945",
      "1949",
      "1951"
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": [
      "daten-jahre"
    ]
  },
  {
    "id": "gen-170",
    "text": "Was gab es während der Zeit des Nationalsozialismus in Deutschland?",
    "choices": [
      "das Verbot von Parteien",
      "das Recht zur freien Entfaltung der Persönlichkeit",
      "Pressefreiheit",
      "den Schutz der Menschenwürde"
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-171",
    "text": "Soziale Marktwirtschaft bedeutet, die Wirtschaft …",
    "choices": [
      "steuert sich allein nach Angebot und Nachfrage.",
      "wird vom Staat geplant und gesteuert, Angebot und Nachfrage werden nicht berücksichtigt.",
      "richtet sich nach der Nachfrage im Ausland.",
      "richtet sich nach Angebot und Nachfrage, aber der Staat sorgt für einen sozialen Ausgleich."
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-172",
    "text": "In welcher Besatzungszone wurde die DDR gegründet? In der …",
    "choices": [
      "amerikanischen Besatzungszone",
      "französischen Besatzungszone",
      "britischen Besatzungszone",
      "sowjetischen Besatzungszone"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-173",
    "text": "Die Bundesrepublik Deutschland ist ein Gründungsmitglied …",
    "choices": [
      "des Nordatlantikpakts (NATO).",
      "der Vereinten Nationen (VN).",
      "der Europäischen Union (EU).",
      "des Warschauer Pakts."
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-174",
    "text": "Wann wurde die DDR gegründet?",
    "choices": [
      "1947",
      "1949",
      "1953",
      "1956"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": [
      "daten-jahre"
    ]
  },
  {
    "id": "gen-175",
    "text": "Wie viele Besatzungszonen gab es in Deutschland nach dem Zweiten Weltkrieg?",
    "choices": [
      "3",
      "4",
      "5",
      "6"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-176",
    "text": "Wie waren die Besatzungszonen Deutschlands nach 1945 verteilt?",
    "choices": [
      "1=Großbritannien, 2=Sowjetunion, 3=Frankreich, 4=USA",
      "1=Sowjetunion, 2=Großbritannien, 3=USA, 4=Frankreich",
      "1=Großbritannien, 2=Sowjetunion, 3=USA, 4=Frankreich",
      "1=Großbritannien, 2=USA, 3=Sowjetunion, 4=Frankreich"
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": [
      "daten-jahre"
    ]
  },
  {
    "id": "gen-177",
    "text": "Welche deutsche Stadt wurde nach dem Zweiten Weltkrieg in vier Sektoren aufgeteilt?",
    "choices": [
      "München",
      "Berlin",
      "Dresden",
      "Frankfurt/Oder"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-178",
    "text": "Vom Juni 1948 bis zum Mai 1949 wurden die Bürgerinnen und Bürger von West-Berlin durch eine Luftbrücke versorgt. Welcher Umstand war dafür verantwortlich?",
    "choices": [
      "Für Frankreich war eine Versorgung der West-Berliner Bevölkerung mit dem Flugzeug kostengünstiger.",
      "Die amerikanischen Soldatinnen und Soldaten hatten beim Landtransport Angst vor Überfällen.",
      "Für Großbritannien war die Versorgung über die Luftbrücke schneller.",
      "Die Sowjetunion unterbrach den gesamten Verkehr auf dem Landwege."
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": [
      "daten-jahre"
    ]
  },
  {
    "id": "gen-179",
    "text": "Wie endete der Zweite Weltkrieg in Europa offiziell?",
    "choices": [
      "mit dem Tod Adolf Hitlers",
      "durch die bedingungslose Kapitulation Deutschlands",
      "mit dem Rückzug der Deutschen aus den besetzten Gebieten",
      "durch eine Revolution in Deutschland"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-180",
    "text": "Der erste Bundeskanzler der Bundesrepublik Deutschland war …",
    "choices": [
      "Ludwig Erhard.",
      "Willy Brandt.",
      "Konrad Adenauer.",
      "Gerhard Schröder."
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-181",
    "text": "Was wollte Willy Brandt mit seinem Kniefall 1970 im ehemaligen jüdischen Ghetto in Warschau ausdrücken?",
    "choices": [
      "Er hat sich den ehemaligen Alliierten unterworfen.",
      "Er bat Polen und die polnischen Juden um Vergebung.",
      "Er zeigte seine Demut vor dem Warschauer Pakt.",
      "Er sprach ein Gebet am Grab des Unbekannten Soldaten."
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": [
      "daten-jahre"
    ]
  },
  {
    "id": "gen-182",
    "text": "Wie heißt das jüdische Gebetshaus?",
    "choices": [
      "Basilika",
      "Moschee",
      "Synagoge",
      "Kirche"
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-183",
    "text": "Wann war in der Bundesrepublik Deutschland das \"Wirtschaftswunder\"?",
    "choices": [
      "40er Jahre",
      "50er Jahre",
      "70er Jahre",
      "80er Jahre"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": [
      "daten-jahre"
    ]
  },
  {
    "id": "gen-184",
    "text": "Auf welcher rechtlichen Grundlage wurde der Staat Israel gegründet?",
    "choices": [
      "eine Resolution der Vereinten Nationen",
      "ein Beschluss des Zionistenkongresses",
      "ein Vorschlag der Bundesregierung",
      "ein Vorschlag der UdSSR"
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-185",
    "text": "Wofür stand der Ausdruck \"Eiserner Vorhang\"? Für die Abschottung …",
    "choices": [
      "des Warschauer Pakts gegen den Westen",
      "Norddeutschlands gegen Süddeutschland",
      "Nazi-Deutschlands gegen die Alliierten",
      "Europas gegen die USA"
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-186",
    "text": "Im Jahr 1953 gab es in der DDR einen Aufstand, an den lange Zeit in der Bundesrepublik Deutschland ein Feiertag erinnerte. Wann war das?",
    "choices": [
      "1. Mai",
      "17. Juni",
      "20. Juli",
      "9. November"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": [
      "daten-jahre"
    ]
  },
  {
    "id": "gen-187",
    "text": "Welcher deutsche Staat hatte eine schwarz-rot-goldene Flagge mit Hammer, Zirkel und Ährenkranz?",
    "choices": [
      "Preußen",
      "Bundesrepublik Deutschland",
      "\"Drittes Reich\"",
      "DDR"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-188",
    "text": "In welchem Jahr wurde die Mauer in Berlin gebaut?",
    "choices": [
      "1953",
      "1956",
      "1959",
      "1961"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": [
      "daten-jahre"
    ]
  },
  {
    "id": "gen-189",
    "text": "Wann baute die DDR die Mauer in Berlin?",
    "choices": [
      "1919",
      "1933",
      "1961",
      "1990"
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": [
      "daten-jahre"
    ]
  },
  {
    "id": "gen-190",
    "text": "Was bedeutet die Abkürzung DDR?",
    "choices": [
      "Dritter Deutscher Rundfunk",
      "Die Deutsche Republik",
      "Dritte Deutsche Republik",
      "Deutsche Demokratische Republik"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-191",
    "text": "Wann wurde die Mauer in Berlin für alle geöffnet?",
    "choices": [
      "1987",
      "1989",
      "1992",
      "1995"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": [
      "daten-jahre"
    ]
  },
  {
    "id": "gen-192",
    "text": "Welches heutige deutsche Bundesland gehörte früher zum Gebiet der DDR?",
    "choices": [
      "Brandenburg",
      "Bayern",
      "Saarland",
      "Hessen"
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-193",
    "text": "Von 1961 bis 1989 war Berlin …",
    "choices": [
      "ohne Bürgermeister.",
      "ein eigener Staat.",
      "durch eine Mauer geteilt.",
      "nur mit dem Flugzeug erreichbar."
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": [
      "daten-jahre"
    ]
  },
  {
    "id": "gen-194",
    "text": "Am 3. Oktober feiert man in Deutschland den Tag der Deutschen …",
    "choices": [
      "Einheit.",
      "Nation.",
      "Bundesländer.",
      "Städte."
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-195",
    "text": "Welches heutige deutsche Bundesland gehörte früher zum Gebiet der DDR?",
    "choices": [
      "Hessen",
      "Sachsen-Anhalt",
      "Nordrhein-Westfalen",
      "Saarland"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-196",
    "text": "Warum nennt man die Zeit im Herbst 1989 in der DDR \"Die Wende\"? In dieser Zeit veränderte sich die DDR politisch …",
    "choices": [
      "von einer Diktatur zur Demokratie.",
      "von einer liberalen Marktwirtschaft zum Sozialismus.",
      "von einer Monarchie zur Sozialdemokratie.",
      "von einem religiösen Staat zu einem kommunistischen Staat."
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": [
      "daten-jahre"
    ]
  },
  {
    "id": "gen-197",
    "text": "Welches heutige deutsche Bundesland gehörte früher zum Gebiet der DDR?",
    "choices": [
      "Thüringen",
      "Hessen",
      "Bayern",
      "Bremen"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-198",
    "text": "Welches heutige deutsche Bundesland gehörte früher zum Gebiet der DDR?",
    "choices": [
      "Bayern",
      "Niedersachsen",
      "Sachsen",
      "Baden-Württemberg"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-199",
    "text": "Mit der Abkürzung \"Stasi\" meinte man in der DDR …",
    "choices": [
      "das Parlament.",
      "das Ministerium für Staatssicherheit.",
      "eine regierende Partei.",
      "das Ministerium für Volksbildung."
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-200",
    "text": "Welches heutige deutsche Bundesland gehörte früher zum Gebiet der DDR?",
    "choices": [
      "Hessen",
      "Schleswig-Holstein",
      "Mecklenburg-Vorpommern",
      "Saarland"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-201",
    "text": "Welche der folgenden Auflistungen enthält nur Bundesländer, die zum Gebiet der früheren DDR gehörten?",
    "choices": [
      "Niedersachsen, Nordrhein-Westfalen, Hessen, Schleswig-Holstein, Brandenburg",
      "Mecklenburg-Vorpommern, Brandenburg, Sachsen, Sachsen-Anhalt, Thüringen",
      "Bayern, Baden-Württemberg, Rheinland-Pfalz, Thüringen, Sachsen",
      "Sachsen, Thüringen, Hessen, Niedersachen, Brandenburg"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-202",
    "text": "Zu wem gehörte die DDR im \"Kalten Krieg\"?",
    "choices": [
      "zu den Westmächten",
      "zum Warschauer Pakt",
      "zur NATO",
      "zu den blockfreien Staaten"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-203",
    "text": "Wie hieß das Wirtschaftssystem der DDR?",
    "choices": [
      "Marktwirtschaft",
      "Planwirtschaft",
      "Angebot und Nachfrage",
      "Kapitalismus"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-204",
    "text": "Wie wurden die Bundesrepublik Deutschland und die DDR zu einem Staat?",
    "choices": [
      "Die Bundesrepublik hat die DDR besetzt.",
      "Die heutigen fünf östlichen Bundesländer sind der Bundesrepublik Deutschland beigetreten.",
      "Die westlichen Bundesländer sind der DDR beigetreten.",
      "Die DDR hat die Bundesrepublik Deutschland besetzt."
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-205",
    "text": "Mit dem Beitritt der DDR zur Bundesrepublik Deutschland gehören die neuen Bundesländer nun auch …",
    "choices": [
      "zur Europäischen Union.",
      "zum Warschauer Pakt.",
      "zur OPEC.",
      "zur Europäischen Verteidigungsgemeinschaft."
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-206",
    "text": "Woran erinnern die sogenannten „Stolpersteine“ in Deutschland?",
    "choices": [
      "an berühmte deutsche Politikerinnen und Politiker",
      "an die Opfer des Nationalsozialismus",
      "an Verkehrstote",
      "an bekannte jüdische Musiker"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-207",
    "text": "In welchem Militärbündnis war die DDR Mitglied?",
    "choices": [
      "in der NATO",
      "im Rheinbund",
      "im Warschauer Pakt",
      "im Europabündnis"
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-208",
    "text": "Was war die \"Stasi\"?",
    "choices": [
      "der Geheimdienst im \"Dritten Reich\"",
      "eine berühmte deutsche Gedenkstätte",
      "der Geheimdienst der DDR",
      "ein deutscher Sportverein während des Zweiten Weltkrieges"
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-209",
    "text": "Welches war das Wappen der Deutschen Demokratischen Republik?",
    "choices": [
      "Bundesadler auf goldenem Grund (Wappen der Bundesrepublik Deutschland)",
      "Preußischer Adler mit Zepter und Reichsapfel",
      "Reichsadler mit Krone (historisches Wappen des Deutschen Kaiserreichs)",
      "Hammer, Sichel und Ährenkranz (Wappen der DDR)"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": [],
    "imageOnly": true,
    "image": "images/wappen-ddr.svg"
  },
  {
    "id": "gen-210",
    "text": "Was ereignete sich am 17. Juni 1953 in der DDR?",
    "choices": [
      "der feierliche Beitritt zum Warschauer Pakt",
      "landesweite Streiks und ein Volksaufstand",
      "der 1. SED-Parteitag",
      "der erste Besuch Fidel Castros"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": [
      "daten-jahre"
    ]
  },
  {
    "id": "gen-211",
    "text": "Welcher Politiker steht für die \"Ostverträge\"?",
    "choices": [
      "Helmut Kohl",
      "Willy Brandt",
      "Michail Gorbatschow",
      "Ludwig Erhard"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-212",
    "text": "Wie heißt Deutschland mit vollem Namen?",
    "choices": [
      "Bundesstaat Deutschland",
      "Bundesländer Deutschland",
      "Bundesrepublik Deutschland",
      "Bundesbezirk Deutschland"
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-213",
    "text": "Wie viele Einwohner hat Deutschland?",
    "choices": [
      "70 Millionen",
      "78 Millionen",
      "84 Millionen",
      "90 Millionen"
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-214",
    "text": "Welche Farben hat die deutsche Flagge?",
    "choices": [
      "schwarz-rot-gold",
      "rot-weiß-schwarz",
      "schwarz-rot-grün",
      "schwarz-gelb-rot"
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-215",
    "text": "Wer wird als \"Kanzler der Deutschen Einheit\" bezeichnet?",
    "choices": [
      "Gerhard Schröder",
      "Helmut Kohl",
      "Konrad Adenauer",
      "Helmut Schmidt"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-216",
    "text": "Welches Symbol ist im Plenarsaal des Deutschen Bundestages zu sehen?",
    "choices": [
      "der Bundesadler",
      "die Fahne der Stadt Berlin",
      "der Reichsadler",
      "die Reichskrone"
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ],
    "imageOnly": true,
    "image": "images/wappen-brd.svg"
  },
  {
    "id": "gen-217",
    "text": "In welchem Zeitraum gab es die Deutsche Demokratische Republik (DDR)?",
    "choices": [
      "1919 bis 1927",
      "1933 bis 1945",
      "1945 bis 1961",
      "1949 bis 1990"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": [
      "daten-jahre"
    ]
  },
  {
    "id": "gen-218",
    "text": "Wie viele Bundesländer kamen bei der Wiedervereinigung 1990 zur Bundesrepublik Deutschland hinzu?",
    "choices": [
      "4",
      "5",
      "6",
      "7"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": [
      "daten-jahre"
    ]
  },
  {
    "id": "gen-219",
    "text": "Die Bundesrepublik Deutschland hat die Grenzen von heute seit …",
    "choices": [
      "1933",
      "1949",
      "1971",
      "1990"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": [
      "daten-jahre"
    ]
  },
  {
    "id": "gen-220",
    "text": "Der 27. Januar ist in Deutschland ein offizieller Gedenktag. Woran erinnert dieser Tag?",
    "choices": [
      "an das Ende des Zweiten Weltkrieges",
      "an die Verabschiedung des Grundgesetzes",
      "an die Wiedervereinigung Deutschlands",
      "an die Opfer des Nationalsozialismus (Tag der Befreiung des Vernichtungslagers Auschwitz)"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-221",
    "text": "Deutschland ist Mitglied des Schengener Abkommens. Was bedeutet das?",
    "choices": [
      "Deutsche können in viele Länder Europas ohne Passkontrolle reisen.",
      "Alle Menschen können ohne Personenkontrolle in Deutschland einreisen.",
      "Deutsche können ohne Passkontrolle in jedes Land reisen.",
      "Deutsche können in jedem Land mit dem Euro bezahlen."
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-222",
    "text": "Welches Land ist ein Nachbarland von Deutschland?",
    "choices": [
      "Ungarn",
      "Portugal",
      "Spanien",
      "Schweiz"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-223",
    "text": "Welches Land ist ein Nachbarland von Deutschland?",
    "choices": [
      "Rumänien",
      "Bulgarien",
      "Polen",
      "Griechenland"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-224",
    "text": "Was bedeutet die Abkürzung EU?",
    "choices": [
      "Europäische Unternehmen",
      "Europäische Union",
      "Einheitliche Union",
      "Euro Union"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-225",
    "text": "In welchem anderen Land gibt es eine große deutschsprachige Bevölkerung?",
    "choices": [
      "Tschechien",
      "Norwegen",
      "Spanien",
      "Österreich"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-226",
    "text": "Welche ist die Flagge der Europäischen Union?",
    "choices": [
      "Blaue Flagge mit einem einzelnen goldenen Stern in der Mitte",
      "Blaue Flagge mit einem Kreis aus zwölf goldenen Sternen (Flagge der Europäischen Union)",
      "Rot-weiß-blaue Trikolore (Flagge Frankreichs)",
      "Blaue Flagge mit weißem Blattkranz (Flagge der Vereinten Nationen)"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": [],
    "imageOnly": true,
    "image": "images/flagge-eu.svg"
  },
  {
    "id": "gen-227",
    "text": "Welches Land ist ein Nachbarland von Deutschland?",
    "choices": [
      "Finnland",
      "Dänemark",
      "Norwegen",
      "Schweden"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-228",
    "text": "Wie wird der Beitritt der DDR zur Bundesrepublik Deutschland im Jahr 1990 allgemein genannt?",
    "choices": [
      "NATO-Osterweiterung",
      "EU-Osterweiterung",
      "Deutsche Wiedervereinigung",
      "Europäische Gemeinschaft"
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": [
      "daten-jahre"
    ]
  },
  {
    "id": "gen-229",
    "text": "Welches Land ist ein Nachbarland von Deutschland?",
    "choices": [
      "Spanien",
      "Bulgarien",
      "Norwegen",
      "Luxemburg"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-230",
    "text": "Das Europäische Parlament wird regelmäßig gewählt, nämlich alle …",
    "choices": [
      "5 Jahre.",
      "6 Jahre.",
      "7 Jahre.",
      "8 Jahre."
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-231",
    "text": "Was bedeutet der Begriff \"europäische Integration\"?",
    "choices": [
      "Damit sind amerikanische Einwanderinnen und Einwanderer in Europa gemeint.",
      "Der Begriff meint den Einwanderungsstopp nach Europa.",
      "Damit sind europäische Auswanderinnen und Auswanderer in den USA gemeint.",
      "Der Begriff meint den Zusammenschluss europäischer Staaten zur EU."
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-232",
    "text": "Wer wird bei der Europawahl gewählt?",
    "choices": [
      "die Europäische Kommission",
      "die Länder, die in die EU eintreten dürfen",
      "die Abgeordneten des Europäischen Parlaments",
      "die europäische Verfassung"
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-233",
    "text": "Welches Land ist ein Nachbarland von Deutschland?",
    "choices": [
      "Tschechien",
      "Bulgarien",
      "Griechenland",
      "Portugal"
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-234",
    "text": "Wo ist ein Sitz des Europäischen Parlaments?",
    "choices": [
      "London",
      "Paris",
      "Berlin",
      "Straßburg"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-235",
    "text": "Der damalige französische Staatspräsident François Mitterrand und der damalige deutsche Bundeskanzler Helmut Kohl gedenken in Verdun gemeinsam der Toten beider Weltkriege. Welches Ziel der Europäischen Union wird bei diesem Treffen deutlich?",
    "choices": [
      "Freundschaft zwischen England und Deutschland",
      "Reisefreiheit in alle Länder der EU",
      "Frieden und Sicherheit in den Ländern der EU",
      "einheitliche Feiertage in den Ländern der EU"
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "gen-236",
    "text": "Wie viele Mitgliedstaaten hat die EU heute?",
    "choices": [
      "21",
      "23",
      "25",
      "27"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-237",
    "text": "2007 wurde das 50-jährige Jubiläum der \"Römischen Verträge\" gefeiert. Was war der Inhalt der Verträge?",
    "choices": [
      "Beitritt Deutschlands zur NATO",
      "Gründung der Europäischen Wirtschaftsgemeinschaft (EWG)",
      "Verpflichtung Deutschlands zu Reparationsleistungen",
      "Festlegung der Oder-Neiße-Linie als Ostgrenze"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": [
      "daten-jahre"
    ]
  },
  {
    "id": "gen-238",
    "text": "An welchen Orten arbeitet das Europäische Parlament?",
    "choices": [
      "Paris, London und Den Haag",
      "Straßburg, Luxemburg und Brüssel",
      "Rom, Bern und Wien",
      "Bonn, Zürich und Mailand"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-239",
    "text": "Durch welche Verträge schloss sich die Bundesrepublik Deutschland mit anderen Staaten zur Europäischen Wirtschaftsgemeinschaft zusammen?",
    "choices": [
      "durch die \"Hamburger Verträge\"",
      "durch die \"Römischen Verträge\"",
      "durch die \"Pariser Verträge\"",
      "durch die \"Londoner Verträge\""
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-240",
    "text": "Seit wann bezahlt man in Deutschland mit dem Euro in bar?",
    "choices": [
      "1995",
      "1998",
      "2002",
      "2005"
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": [
      "daten-jahre"
    ]
  },
  {
    "id": "gen-241",
    "text": "Frau Seger bekommt ein Kind. Was muss sie tun, um Elterngeld zu erhalten?",
    "choices": [
      "Sie muss an ihre Krankenkasse schreiben.",
      "Sie muss einen Antrag bei der Elterngeldstelle stellen.",
      "Sie muss nichts tun, denn sie bekommt automatisch Elterngeld.",
      "Sie muss das Arbeitsamt um Erlaubnis bitten."
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-242",
    "text": "Wer entscheidet, ob ein Kind in Deutschland in den Kindergarten geht?",
    "choices": [
      "der Staat",
      "die Bundesländer",
      "die Eltern/die Erziehungsberechtigten",
      "die Schulen"
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-243",
    "text": "Maik und Sybille wollen mit Freunden an ihrem deutschen Wohnort eine Demonstration auf der Straße abhalten. Was müssen sie vorher tun?",
    "choices": [
      "Sie müssen die Demonstration anmelden.",
      "Sie müssen nichts tun. Man darf in Deutschland jederzeit überall demonstrieren.",
      "Sie können gar nichts tun, denn Demonstrationen sind in Deutschland grundsätzlich verboten.",
      "Maik und Sybille müssen einen neuen Verein gründen, weil nur Vereine demonstrieren dürfen."
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-244",
    "text": "Welchen Schulabschluss braucht man normalerweise, um an einer Universität in Deutschland ein Studium zu beginnen?",
    "choices": [
      "das Abitur",
      "ein Diplom",
      "die Prokura",
      "eine Gesellenprüfung"
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-245",
    "text": "Wer darf in Deutschland nicht als Paar zusammenleben?",
    "choices": [
      "Hans (20 Jahre) und Marie (19 Jahre)",
      "Tom (20 Jahre) und Klaus (45 Jahre)",
      "Sofie (35 Jahre) und Lisa (40 Jahre)",
      "Anne (13 Jahre) und Tim (25 Jahre)"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-246",
    "text": "Ab welchem Alter ist man in Deutschland volljährig?",
    "choices": [
      "16",
      "18",
      "19",
      "21"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-247",
    "text": "Eine Frau ist schwanger. Sie ist kurz vor und nach der Geburt ihres Kindes vom Gesetz besonders beschützt. Wie heißt dieser Schutz?",
    "choices": [
      "Elternzeit",
      "Mutterschutz",
      "Geburtsvorbereitung",
      "Wochenbett"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-248",
    "text": "Die Erziehung der Kinder ist in Deutschland vor allem Aufgabe …",
    "choices": [
      "des Staates.",
      "der Eltern.",
      "der Großeltern.",
      "der Schulen."
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-249",
    "text": "Wer ist in Deutschland hauptsächlich verantwortlich für die Kindererziehung?",
    "choices": [
      "der Staat",
      "die Eltern",
      "die Verwandten",
      "die Schulen"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-250",
    "text": "In Deutschland hat man die besten Chancen auf einen gut bezahlten Arbeitsplatz, wenn man …",
    "choices": [
      "katholisch ist.",
      "gut ausgebildet ist.",
      "eine Frau ist.",
      "Mitglied einer Partei ist."
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-251",
    "text": "Wenn man in Deutschland ein Kind schlägt, …",
    "choices": [
      "geht das niemanden etwas an.",
      "geht das nur die Familie etwas an.",
      "kann man dafür nicht bestraft werden.",
      "kann man dafür bestraft werden."
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-252",
    "text": "In Deutschland …",
    "choices": [
      "darf man zur gleichen Zeit nur mit einer Partnerin/einem Partner verheiratet sein.",
      "kann man mehrere Ehepartnerinnen/Ehepartner gleichzeitig haben.",
      "darf man nicht wieder heiraten, wenn man einmal verheiratet war.",
      "darf eine Frau nicht wieder heiraten, wenn ihr Mann gestorben ist."
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-253",
    "text": "Wo müssen Sie sich anmelden, wenn Sie in Deutschland umziehen?",
    "choices": [
      "beim Einwohnermeldeamt",
      "beim Standesamt",
      "beim Ordnungsamt",
      "beim Gewerbeamt"
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-254",
    "text": "In Deutschland dürfen Ehepaare sich scheiden lassen. Meistens müssen sie dazu das \"Trennungsjahr\" einhalten. Was bedeutet das?",
    "choices": [
      "Der Scheidungsprozess dauert ein Jahr.",
      "Die Ehegatten sind ein Jahr verheiratet, dann ist die Scheidung möglich.",
      "Das Besuchsrecht für die Kinder gilt ein Jahr.",
      "Die Ehegatten führen mindestens ein Jahr getrennt ihr eigenes Leben. Danach ist die Scheidung möglich."
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-255",
    "text": "Bei Erziehungsproblemen können Eltern in Deutschland Hilfe erhalten vom …",
    "choices": [
      "Ordnungsamt.",
      "Schulamt.",
      "Jugendamt.",
      "Gesundheitsamt."
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-256",
    "text": "Ein Ehepaar möchte in Deutschland ein Restaurant eröffnen. Was braucht es dazu unbedingt?",
    "choices": [
      "eine Erlaubnis der Polizei",
      "eine Genehmigung einer Partei",
      "eine Genehmigung des Einwohnermeldeamts",
      "eine Gaststättenerlaubnis von der zuständigen Behörde"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-257",
    "text": "Eine erwachsene Frau möchte in Deutschland das Abitur nachholen. Das kann sie an …",
    "choices": [
      "einer Hochschule.",
      "einem Abendgymnasium.",
      "einer Hauptschule.",
      "einer Privatuniversität."
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-258",
    "text": "Was darf das Jugendamt in Deutschland?",
    "choices": [
      "Es entscheidet, welche Schule das Kind besucht.",
      "Es kann ein Kind, das geschlagen wird oder hungern muss, aus der Familie nehmen.",
      "Es bezahlt das Kindergeld an die Eltern.",
      "Es kontrolliert, ob das Kind einen Kindergarten besucht."
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-259",
    "text": "Das Berufsinformationszentrum BIZ bei der Bundesagentur für Arbeit in Deutschland hilft bei der …",
    "choices": [
      "Rentenberechnung.",
      "Lehrstellensuche.",
      "Steuererklärung.",
      "Krankenversicherung."
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-260",
    "text": "In Deutschland hat ein Kind in der Schule …",
    "choices": [
      "Recht auf unbegrenzte Freizeit.",
      "Wahlfreiheit für alle Fächer.",
      "Anspruch auf Schulgeld.",
      "Anwesenheitspflicht."
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-261",
    "text": "Ein Mann möchte mit 30 Jahren in Deutschland sein Abitur nachholen. Wo kann er das tun? An …",
    "choices": [
      "einer Hochschule.",
      "einem Abendgymnasium.",
      "einer Hauptschule.",
      "einer Privatuniversität."
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-262",
    "text": "Was bedeutet in Deutschland der Grundsatz der Gleichbehandlung?",
    "choices": [
      "Niemand darf z.B. wegen einer Behinderung benachteiligt werden.",
      "Man darf andere Personen benachteiligen, wenn ausreichende persönliche Gründe hierfür vorliegen.",
      "Niemand darf gegen Personen klagen, wenn sie benachteiligt wurden.",
      "Es ist für alle Gesetz, benachteiligten Gruppen jährlich Geld zu spenden."
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-263",
    "text": "In Deutschland sind Jugendliche ab 14 Jahren strafmündig. Das bedeutet: Jugendliche, die 14 Jahre und älter sind und gegen Strafgesetze verstoßen, …",
    "choices": [
      "werden bestraft.",
      "werden wie Erwachsene behandelt.",
      "teilen die Strafe mit ihren Eltern.",
      "werden nicht bestraft."
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-264",
    "text": "Zu welchem Fest tragen Menschen in Deutschland bunte Kostüme und Masken?",
    "choices": [
      "am Rosenmontag",
      "am Maifeiertag",
      "beim Oktoberfest",
      "an Pfingsten"
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-265",
    "text": "Wohin muss man in Deutschland zuerst gehen, wenn man heiraten möchte?",
    "choices": [
      "zum Einwohnermeldeamt",
      "zum Ordnungsamt",
      "zur Agentur für Arbeit",
      "zum Standesamt"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-266",
    "text": "Wann beginnt die gesetzliche Nachtruhe in Deutschland?",
    "choices": [
      "wenn die Sonne untergeht",
      "wenn die Nachbarn schlafen gehen",
      "um 0 Uhr, Mitternacht",
      "um 22 Uhr"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": [
      "daten-jahre"
    ]
  },
  {
    "id": "gen-267",
    "text": "Eine junge Frau in Deutschland, 22 Jahre alt, lebt mit ihrem Freund zusammen. Die Eltern der Frau finden das nicht gut, weil ihnen der Freund nicht gefällt. Was können die Eltern tun?",
    "choices": [
      "Sie müssen die Entscheidung der volljährigen Tochter respektieren.",
      "Sie haben das Recht, die Tochter in die elterliche Wohnung zurückzuholen.",
      "Sie können zur Polizei gehen und die Tochter anzeigen.",
      "Sie suchen einen anderen Mann für die Tochter."
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-268",
    "text": "Eine junge Frau will den Führerschein machen. Sie hat Angst vor der Prüfung, weil ihre Muttersprache nicht Deutsch ist. Was ist richtig?",
    "choices": [
      "Sie muss mindestens zehn Jahre in Deutschland leben, bevor sie den Führerschein machen kann.",
      "Wenn sie kein Deutsch kann, darf sie keinen Führerschein haben.",
      "Sie muss den Führerschein in dem Land machen, in dem man ihre Sprache spricht.",
      "Sie kann die Theorie-Prüfung vielleicht in ihrer Muttersprache machen. Es gibt mehr als zehn Sprachen zur Auswahl."
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-269",
    "text": "In Deutschland haben Kinder ab dem Alter von drei Jahren bis zur Ersteinschulung einen Anspruch auf …",
    "choices": [
      "monatliches Taschengeld.",
      "einen Platz in einem Sportverein.",
      "einen Kindergartenplatz.",
      "einen Ferienpass."
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-270",
    "text": "Die Volkshochschule in Deutschland ist eine Einrichtung …",
    "choices": [
      "für den Religionsunterricht.",
      "nur für Jugendliche.",
      "zur Weiterbildung.",
      "nur für Rentnerinnen und Rentner."
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-271",
    "text": "Was ist in Deutschland ein Brauch zu Weihnachten?",
    "choices": [
      "bunte Eier verstecken",
      "einen Tannenbaum schmücken",
      "sich mit Masken und Kostümen verkleiden",
      "Kürbisse vor die Tür stellen"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-272",
    "text": "Welche Lebensform ist in Deutschland nicht erlaubt?",
    "choices": [
      "Mann und Frau sind geschieden und leben mit neuen Partnern zusammen.",
      "Zwei Frauen leben zusammen.",
      "Ein alleinerziehender Vater lebt mit seinen zwei Kindern zusammen.",
      "Ein Mann ist mit zwei Frauen zur selben Zeit verheiratet."
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-273",
    "text": "Bei Erziehungsproblemen gehen Sie in Deutschland …",
    "choices": [
      "zur Ärztin/zum Arzt.",
      "zum Gesundheitsamt.",
      "zum Einwohnermeldeamt.",
      "zum Jugendamt."
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-274",
    "text": "Sie haben in Deutschland absichtlich einen Brief geöffnet, der an eine andere Person adressiert ist. Was haben Sie nicht beachtet?",
    "choices": [
      "das Schweigerecht",
      "das Briefgeheimnis",
      "die Schweigepflicht",
      "die Meinungsfreiheit"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-275",
    "text": "Was braucht man in Deutschland für eine Ehescheidung?",
    "choices": [
      "die Einwilligung der Eltern",
      "ein Attest einer Ärztin/eines Arztes",
      "die Einwilligung der Kinder",
      "die Unterstützung einer Anwältin/eines Anwalts"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-276",
    "text": "Was sollten Sie tun, wenn Sie von Ihrer Ansprechpartnerin/Ihrem Ansprechpartner in einer deutschen Behörde schlecht behandelt werden?",
    "choices": [
      "Ich kann nichts tun.",
      "Ich muss mir diese Behandlung gefallen lassen.",
      "Ich drohe der Person.",
      "Ich kann mich bei der Behördenleiterin/beim Behördenleiter beschweren."
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-277",
    "text": "Eine Frau, die ein zweijähriges Kind hat, bewirbt sich in Deutschland um eine Stelle. Was ist ein Beispiel für Diskriminierung? Sie bekommt die Stelle nur deshalb nicht, weil sie …",
    "choices": [
      "kein Englisch spricht.",
      "zu hohe Gehaltsvorstellungen hat.",
      "keine Erfahrungen in diesem Beruf hat.",
      "Mutter ist."
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-278",
    "text": "Ein Mann im Rollstuhl hat sich auf eine Stelle als Buchhalter beworben. Was ist ein Beispiel für Diskriminierung? Er bekommt die Stelle nur deshalb nicht, weil er …",
    "choices": [
      "im Rollstuhl sitzt.",
      "keine Erfahrung hat.",
      "zu hohe Gehaltsvorstellungen hat.",
      "kein Englisch spricht."
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-279",
    "text": "In den meisten Mietshäusern in Deutschland gibt es eine \"Hausordnung\". Was steht in einer solchen \"Hausordnung\"? Sie nennt …",
    "choices": [
      "Regeln für die Benutzung öffentlicher Verkehrsmittel.",
      "alle Mieterinnen und Mieter im Haus.",
      "Regeln, an die sich alle Bewohnerinnen und Bewohner halten müssen.",
      "die Adresse des nächsten Ordnungsamtes."
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-280",
    "text": "Wenn Sie sich in Deutschland gegen einen falschen Steuerbescheid wehren wollen, müssen Sie …",
    "choices": [
      "nichts machen.",
      "den Bescheid wegwerfen.",
      "Einspruch einlegen.",
      "warten, bis ein anderer Bescheid kommt."
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-281",
    "text": "Zwei Freunde wollen in ein öffentliches Schwimmbad in Deutschland. Beide haben eine dunkle Hautfarbe und werden deshalb nicht hineingelassen. Welches Recht wird in dieser Situation verletzt? Das Recht auf …",
    "choices": [
      "Meinungsfreiheit",
      "Gleichbehandlung",
      "Versammlungsfreiheit",
      "Freizügigkeit"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-282",
    "text": "Welches Ehrenamt müssen deutsche Staatsbürgerinnen und Staatsbürger übernehmen, wenn sie dazu aufgefordert werden?",
    "choices": [
      "Vereinstrainerin/Vereinstrainer",
      "Wahlhelferin/Wahlhelfer",
      "Bibliotheksaufsicht",
      "Lehrerin/Lehrer"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-283",
    "text": "Was tun Sie, wenn Sie eine falsche Rechnung von einer deutschen Behörde bekommen?",
    "choices": [
      "Ich lasse die Rechnung liegen.",
      "Ich lege Widerspruch bei der Behörde ein.",
      "Ich schicke die Rechnung an die Behörde zurück.",
      "Ich gehe mit der Rechnung zum Finanzamt."
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-284",
    "text": "Was man für die Arbeit können muss, ändert sich in Zukunft sehr schnell. Was kann man tun?",
    "choices": [
      "Es ist egal, was man lernt.",
      "Erwachsene müssen auch nach der Ausbildung immer weiter lernen.",
      "Kinder lernen in der Schule alles, was im Beruf wichtig ist. Nach der Schule muss man nicht weiter lernen.",
      "Alle müssen früher aufhören zu arbeiten, weil sich alles ändert."
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-285",
    "text": "Frau Frost arbeitet als fest angestellte Mitarbeiterin in einem Büro. Was muss sie nicht von ihrem Gehalt bezahlen?",
    "choices": [
      "Lohnsteuer",
      "Beiträge zur Arbeitslosenversicherung",
      "Beiträge zur Renten- und Krankenversicherung",
      "Umsatzsteuer"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-286",
    "text": "Welche Organisation in einer Firma hilft den Arbeitnehmerinnen und Arbeitnehmern bei Problemen mit der Arbeitgeberin/dem Arbeitgeber?",
    "choices": [
      "der Betriebsrat",
      "die Betriebsprüferin/der Betriebsprüfer",
      "die Betriebsgruppe",
      "das Betriebsmanagement"
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-287",
    "text": "Sie möchten bei einer Firma in Deutschland ihr Arbeitsverhältnis beenden. Was müssen Sie beachten?",
    "choices": [
      "die Gehaltszahlungen",
      "die Arbeitszeit",
      "die Kündigungsfrist",
      "die Versicherungspflicht"
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-288",
    "text": "Woraus begründet sich Deutschlands besondere Verantwortung für Israel?",
    "choices": [
      "aus der Mitgliedschaft in der Europäischen Union (EU)",
      "aus den nationalsozialistischen Verbrechen gegen Juden",
      "aus dem Grundgesetz der Bundesrepublik Deutschland",
      "aus der christlichen Tradition"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-289",
    "text": "Ein Mann mit dunkler Hautfarbe bewirbt sich um eine Stelle als Kellner in einem Restaurant in Deutschland. Was ist ein Beispiel für Diskriminierung? Er bekommt die Stelle nur deshalb nicht, weil …",
    "choices": [
      "seine Deutschkenntnisse zu gering sind.",
      "er zu hohe Gehaltsvorstellungen hat.",
      "er eine dunkle Haut hat.",
      "er keine Erfahrungen im Beruf hat."
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-290",
    "text": "Sie haben in Deutschland einen Fernseher gekauft. Zu Hause packen Sie den Fernseher aus, doch er funktioniert nicht. Der Fernseher ist kaputt. Was können Sie machen?",
    "choices": [
      "eine Anzeige schreiben",
      "den Fernseher reklamieren",
      "das Gerät ungefragt austauschen",
      "die Garantie verlängern"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-291",
    "text": "Warum muss man in Deutschland bei der Steuererklärung aufschreiben, ob man zu einer Kirche gehört oder nicht? Weil …",
    "choices": [
      "es eine Kirchensteuer gibt, die an die Einkommen- und Lohnsteuer geknüpft ist.",
      "das für die Statistik in Deutschland wichtig ist.",
      "man mehr Steuern zahlen muss, wenn man nicht zu einer Kirche gehört.",
      "die Kirche für die Steuererklärung verantwortlich ist."
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-292",
    "text": "Die Menschen in Deutschland leben nach dem Grundsatz der religiösen Toleranz. Was bedeutet das?",
    "choices": [
      "Es dürfen keine Moscheen gebaut werden.",
      "Alle Menschen glauben an Gott.",
      "Jeder kann glauben, was er möchte.",
      "Der Staat entscheidet, an welchen Gott die Menschen glauben."
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-293",
    "text": "Was ist in Deutschland ein Brauch zu Ostern?",
    "choices": [
      "Kürbisse vor die Tür stellen",
      "einen Tannenbaum schmücken",
      "Eier bemalen",
      "Raketen in die Luft schießen"
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-294",
    "text": "Pfingsten ist ein …",
    "choices": [
      "christlicher Feiertag.",
      "deutscher Gedenktag.",
      "internationaler Trauertag.",
      "bayerischer Brauch."
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-295",
    "text": "Welche Religion hat die europäische und deutsche Kultur geprägt?",
    "choices": [
      "der Hinduismus",
      "das Christentum",
      "der Buddhismus",
      "der Islam"
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-296",
    "text": "In Deutschland nennt man die letzten vier Wochen vor Weihnachten …",
    "choices": [
      "den Buß- und Bettag.",
      "das Erntedankfest.",
      "die Adventszeit.",
      "Allerheiligen."
    ],
    "correctIndex": 2,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-297",
    "text": "Aus welchem Land sind die meisten Migrantinnen und Migranten nach Deutschland gekommen?",
    "choices": [
      "Italien",
      "Polen",
      "Marokko",
      "Türkei"
    ],
    "correctIndex": 3,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-298",
    "text": "In der DDR lebten vor allem Migrantinnen und Migranten aus …",
    "choices": [
      "Vietnam, Polen, Mosambik.",
      "Frankreich, Rumänien, Somalia.",
      "Chile, Ungarn, Simbabwe.",
      "Nordkorea, Mexiko, Ägypten."
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-299",
    "text": "Ausländische Arbeitnehmerinnen und Arbeitnehmer, die in den 50er und 60er Jahren von der Bundesrepublik Deutschland angeworben wurden, nannte man …",
    "choices": [
      "Schwarzarbeiterinnen/Schwarzarbeiter.",
      "Gastarbeiterinnen/Gastarbeiter.",
      "Zeitarbeiterinnen/Zeitarbeiter.",
      "Schichtarbeiterinnen/Schichtarbeiter."
    ],
    "correctIndex": 1,
    "scope": "general",
    "categories": []
  },
  {
    "id": "gen-300",
    "text": "Aus welchem Land kamen die ersten Gastarbeiterinnen und Gastarbeiter in die Bundesrepublik Deutschland?",
    "choices": [
      "Italien",
      "Spanien",
      "Portugal",
      "Türkei"
    ],
    "correctIndex": 0,
    "scope": "general",
    "categories": []
  },
  {
    "id": "be-01",
    "text": "Welches Wappen gehört zum Bundesland Berlin?",
    "choices": [
      "Wappen mit einem roten Adler auf weißem Grund (Brandenburg)",
      "Wappen mit einer weißen Burg mit rotem Tor auf rotem Grund (Hamburg)",
      "Wappen mit zwei goldenen Schlüsseln auf rotem Grund (Bremen)",
      "Wappen mit einem aufrechten schwarzen Bären auf weißem Grund (Berlin)"
    ],
    "correctIndex": 3,
    "scope": "berlin",
    "categories": [],
    "imageOnly": true,
    "image": "images/wappen-berlin.svg"
  },
  {
    "id": "be-02",
    "text": "Welches ist ein Bezirk von Berlin?",
    "choices": [
      "Altona",
      "Prignitz",
      "Pankow",
      "Mecklenburgische Seenplatte"
    ],
    "correctIndex": 2,
    "scope": "berlin",
    "categories": []
  },
  {
    "id": "be-03",
    "text": "Für wie viele Jahre wird das Landesparlament in Berlin gewählt?",
    "choices": [
      "3",
      "4",
      "5",
      "6"
    ],
    "correctIndex": 2,
    "scope": "berlin",
    "categories": []
  },
  {
    "id": "be-04",
    "text": "Ab welchem Alter darf man in Berlin bei Kommunalwahlen (Wahl der Bezirksverordnetenversammlung) wählen?",
    "choices": [
      "14",
      "16",
      "18",
      "20"
    ],
    "correctIndex": 1,
    "scope": "berlin",
    "categories": []
  },
  {
    "id": "be-05",
    "text": "Welche Farben hat die Landesflagge von Berlin?",
    "choices": [
      "blau-weiß-rot",
      "weiß-rot",
      "grün-weiß-rot",
      "schwarz-gold"
    ],
    "correctIndex": 1,
    "scope": "berlin",
    "categories": []
  },
  {
    "id": "be-06",
    "text": "Wo können Sie sich in Berlin über politische Themen informieren?",
    "choices": [
      "beim Ordnungsamt der Gemeinde",
      "bei den Kirchen",
      "bei der Verbraucherzentrale",
      "bei der Landeszentrale für politische Bildung"
    ],
    "correctIndex": 3,
    "scope": "berlin",
    "categories": []
  },
  {
    "id": "be-07",
    "text": "Welches Bundesland ist ein Stadtstaat?",
    "choices": [
      "Berlin",
      "Saarland",
      "Brandenburg",
      "Hessen"
    ],
    "correctIndex": 0,
    "scope": "berlin",
    "categories": []
  },
  {
    "id": "be-08",
    "text": "Welches Bundesland ist Berlin?",
    "choices": [
      "Bayern",
      "Nordrhein-Westfalen",
      "Sachsen",
      "Berlin"
    ],
    "correctIndex": 3,
    "scope": "berlin",
    "categories": [],
    "imageOnly": true,
    "image": "images/berlin-karte.svg"
  },
  {
    "id": "be-09",
    "text": "Wie nennt man die Regierungschefin/den Regierungschef des Stadtstaates Berlin?",
    "choices": [
      "Ministerpräsidentin/Ministerpräsident",
      "Oberbürgermeisterin/Oberbürgermeister",
      "Präsidentin/Präsident des Senates",
      "Regierende Bürgermeisterin/Regierender Bürgermeister"
    ],
    "correctIndex": 3,
    "scope": "berlin",
    "categories": [
      "staatsorgane"
    ]
  },
  {
    "id": "be-10",
    "text": "Welche Senatorin/welchen Senator hat Berlin nicht?",
    "choices": [
      "Finanzsenatorin/Finanzsenator",
      "Innensenatorin/Innensenator",
      "Senatorin/Senator für Außenbeziehungen",
      "Justizsenatorin/Justizsenator"
    ],
    "correctIndex": 2,
    "scope": "berlin",
    "categories": []
  }
];

if (typeof module !== 'undefined') module.exports = QUESTIONS;
