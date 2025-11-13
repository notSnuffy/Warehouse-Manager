PostgreSQL -> popsat presneji alternative: might be good -> spis, ze jsou ekvivalentni, ale duvod proc nejaka lepsi
vyresit velikosti obrazku (v budoucnu)

Popsat vyber mezi komunikaci backend sluzeb s Gateway/naprimo a proc jsem si vybral naprimo.
Popsat alternativu proc se nahradil properties column z jsonb na vytvoreni 5 sloupcu do shapes/vytvoreni inheritance tabulek s pamatovanim indexu.
Pridat nejakou tym/organization tabulku na grupnuti uzivatelu.
Vysvetlit, jak vyresit, ze subcomponenty u kontejneru si spatne aktualizuji jejich x, y, width, height, displayWidth a displayHeight. To same plati pro jednoduchu call na getTopLeft atd.
Musime volat getTopLeft(undefined, true), cimz ziskame globalni souradnice. Take nestaci pote na konvertovani do lokalniho prostoru kontejneru zavolat container.getLocalPoint
s globalni hodnotou centra subcomponenty, musime si vzit transformmatrix containeru a z toho vzit globalni souradnice, z kterych se nasledne vypocita lokalni hodnota.
Instruction builder s pouzitim stacku mistu pamatovani id na parent
Vysvetlit soft delete v DB
Vysvetlit potrebu convertoru pro instrukce, aby se mohla udelat validace instrukci pred ulozenim do databaze posilanim listu instrukci v DTO. -> neposilame raw string instrukci
Spojit nektere databaze mikrosluzeb do jedne.
Popsat, proc jsou ulozene instrukce primo v Zone a nepamatujeme si pouze id na ShapeInstance -> Neni sikovny zpusob, jak instance sparovat, kdybychom udelali batch operaci a ukladat po jednom by bylo neefektivni.
Popsat problem se spatnymi pozicemi subcomponent v kontejnerech, kdyz byly hodne rotovane.
Popsat problem u ukladani, protoze Phaser neaktualizuje hodnoty pro child komponenty -> jak jsem musel vypocit sirku a vysku + pozice.
Popsat problem s tahanim elementu mimo Phaser do Phaseru pro hover.
Popsat zmenu na UUID pro composite key v db. -> zadna sikovna autogenerace pro Long neni
Popsat vyber slowly changing dimensions vybraneho typu. (Type 2 s current flagem -> sloupec verze chceme pouzivat v jinych tabulkach, ne jenom jako historii)
Corner preview -> musime dat handler na window, abychom mohli detekovat pohyb pointeru i mimo canvas.
Vysvetlit, proc v ShapeInstance mame sloupec pouze shapeId a manualne tam joinujeme Shape -> chceme vzdy nejnovejsi verzi.
Rekurzivni predmety ve floorview -> global Map, kde zoneInstance si pamatuje jen root predmety a children se hledaji rekurzivne.
Popsat update item -> pouzivame jen raw item id a manualne joinujeme, abychom nemuseli prepisovat puvodni verze pro spravne fungovani. -> tedy smazani nove verze by nic nerozbilo.
Popsat problem update tvaru, kdyz se pohybuje kamera. -> camera panning na okraji nepohybuje tvar.
Popsat nesikovnost hard-coded modal pro vytvoreni tvaru. -> vytvoreni schemata pro pole dynamicky.
Popsat zmenu na ShapeManageru pro lepsi managovani tvaru nez raw array. -> moznost mit undo/redo -> jednoduche pridavani novych tvaru -> napr. Sprite by mel jit jednoduse pridat, spolecne s dynamickym modal.
Popsat problem u deserializace instrukci, kde co ma nastat, kdyz je registrovane vice tvaru s identickou instrukci -> priorita.
Popsat problem s natstavenim hitArea pro tvary -> setInteractive ocekava nejakou instanci tvaru, proto musime poslat callback, ktery ji vytvori pro vytvoreny tvar.
Popsat duvod vybrani database sequence pro generovani id -> mame slozene klice -> nefunguje auto increment. -> zaroven chceme podporovat paralelni vytvareni. -> Java Atomics slozitejsi, pokud vice procesu.
Popsat nesmyslnost vytvareni vertikalni slideru pro prohlizec.
Popsat nutnost mit nejaky fieldMapper pro snapshoty, abychom mohli ukladat do databaze bez nutnosti meneni schemata v DB.
Popsat slozitost manipulace s kamerou, jelikoz minimalni chyba v kalkulaci vede k odhozeni kamery uplne mimo.

19.11. 10:00

linked list na point extremes

Bonus funkce: Implemenovat vrstvy v editorech, aby bylo je mozna zapinat a vypinat.
Drzenim napriklad SHIFT + kliknuti listuje mezi objekty pod kurzorem a vybere ho pro manipulaci.

Implementovat presmerovani do editoru pomoci edit v shape listu.
Odkomentovat mazani v shape listu.
Zmenit lokaci presmerovani po kliknuti na Add New Shape v shape listu, aby se presmerovalo do editoru a ne na root.
Odstranit test data v shape listu.
Pridat dokumentacni komentare do shape listu
Remove shape by melo byt async, kdyby smazani selhalo.
?Optimalizovat odstranovani z listu tak, abychom nemuseli znovu renderovat vsechny prvky.
-> jak to udelat, aby se nerozbila pagination(ubyde prvek -> mohlo se snizit pocet stranek + musi se pridat novy prvek na konec)

UniqueConstraint exception handler hard-coded constraint string jde nejak vyresit?
Ulozit identifikator tvaru do instrukci?
Jak zabranit smazani systemovych radku v db.

Jak sikovne vyresit composite key
Jak udelat, aby shapeId v Shape bylo non-nullable, ale melo nastavene id jako primary key.
Chceme si pamatovat pro instrukce shapeId a verzi, abychom vedeli, jaky tvar instrukce reprezentuje a mohli jsme uzivateli rict, ze se jedna napr. o stary tvar?
Mel by shape editor po ulozeni tvaru potom aktualizovat tento ulozeny tvar nebo znovu vytvorit novy tvar?
Furniture v databazi mit ulozeny i shape verzi pro topDownView nebo automaticky vzit nejnovejsi verzi tvaru?
Mel by se vratit topDownView i kdyz reprezentujici tvar byl smazan? -> pravdepodobne dat uzivateli warning, ze tvar neexistuje, vyrenderovat stejne, ale rict, aby si sel nabytek aktualizovat.
Jak vyresit update podlahy -> mame array furnitureIds -> verzovani zde vede k tomu, ze nektere furniture instances uz nebudou nikdy vyuzite -> naprimo ale smazat vede k netrivialnimu kaskadovani mazani.
To same s nabytkem -> verzovani zde dava smysl, protoze nekdo verzi pred aktualizaci uz mohl vyuzit.

Jak vyresit composite key -> UUID asi funguje, ale rozbije to razeni podle date created v item listu.
-> Identity pise not supported, sequence take nechce fungovat, jelikoz potrebuji obcas id nastavit manualne. Kouknout na max id muze byt problematicke s paralelnimi requesty.
-> Prozatim UUID -> mozna predvytvorit sekvenzi z db a manualne ji pouzivat.
Update item -> chceme vytvorit cely novy strom nebo udelat pouze inplace update rodice a deti? -> napriklad bychom sli a vytvorili kopie vsech deti s novou verzi a tedy aktualizovana verze predmetu by mela tyto nove deti.
-> momentalne inplace update -> cely strom je hodne drahy -> v databazi by byla cela kopie.
Move item -> podobne jako update item
Momentalne jsem nuceny pri vytvoreni nove verze smazat rodice v predesle verzi, aby se neobjevovala starsi verze jako potomek rodice. -> chceme tedy vytvoret cely strom/nejak limitovat, aby children
vratilo pouze potomky, kteri jsou current and not deleted/inplace smazani. Zaroven musim zmenit potomky predmetu na nove verze, aby se neodkazovali na stare verze.
Chceme smazat i stare verze?
API endpoint pro items batch, ktery vraci i deleted predmety -> OK? nebo udelat specialni endpoint -> nyni se pouziva, aby se mohli procistit predmety v zonach -> verzovani zon?
Jak vyresit po zmene Shape na UUID ukladani systemovych tvaru -> momentalne hardcoded UUID
Corner preview vypnout pridavani, potom co je pridano?
Corner preview mel by se corner pridat i pri kliknuti mimo canvas?

Scrollovaci editor
Java atomics, compare and swap na id

Jak by sla vyresit hit area pro container?
Je lepsi zpusob jak udelat camera movement na hrane obrazovky nez update?
Lepsi zpusob, jak udelat drag na hrane nez vraceni tvaru z MoveManagera?
Jak udelat lepe zoom?
Chceme soft delete a versioning pro shape instances?
Jak udelat upozorneni u delete item o tom, jake predmety budou take smazany?
Mel bych projit muj kod a najit vsechna mista, kde dereferencuji hodnotu html elementu a ujistit se, ze element existuje? -> uzivatel ho muze odstranit. -> chtelo by to, ale mel bych to delat pro bakalarku?
Jak vyresit topDownView u nabytku? Momentalne, kdyz uzivatel vybere polygon nebo arc, tak to vzdy vrati defaultni arc a polygon, protoze to je tak ulozene v databazi a ve frontendu na to nekoukam.
-> zaroven, ale nedava smysl, aby nabytek mel menitelny topDownView dle nalady -> mel bych je tedy odendat jako moznost z topDownView, nebo donutit uzivatele, aby se mu v additionalInfoModal ukazalo nadefinovani predmetu?
Udelat pro update nabytku, ze poslu nejaky changed flag, abychom aktualizovali pouze zmenene polozky.

Double click na container dokaze oznacit potomka.

Pojmenovani metod v ShapeManageru

Manager addShape metoda zamezeni duplikatu dava smysl?
Chceme mit pridate kompletne vsechny tvary v manageru nebo pouze korenove?

Rotation knob je schovany kdyz zmackneme kameru presne na limit tvaru. -> jak to vyresit? -> mit okraj vzdy o nekolik pixelu?
Pri undo/redo tvary nebyly zpet zaregistrovany s input managery -> zmena na tag based registraci a kazdy tvar s sebou nese tagy managery, u kterych je registrovany? Je jine lepsi reseni?
Hide pro select manager a move manager je udeleny poslouchanim na undo/redoPerformed -> jine lepsi reseni?
Jak vyresit problem se SortedListem -> strelba eventu -> zatim vyreseno tim, ze manager metody maji parametr, jesli maji vyvolat event nebo ne.
Jak vyresit to, ze jsem pro Container chtel vracet typ v metadatech jako napr custom, ale v mym pripade pro undo/redo to nema znovu volat fetch v custom, ale vytvorit se to jako container?

V AddShapeCommand po vytvoreni vyrobeni snapshotu, aby fungovali undo/redo -> kdyz shape byla custom, tak to znovu fetchovalo z db a dostalo to jine ID. -> pridal jsem override v addShape, ale ten by nefungoval pro potomky,
kde v budoucnu muze byt potreba, aby i potomkove dostali stejny id jako puvodne vytvoreny.

Je moznost jinak vyresit, jak dostat nektery parametry jinam? -> Kdyz mam custom shape na zonu -> musim vytvorit snapshot, aby se udrzovalo interni id -> snapshot
nema ale vsechny puvodni parametry -> pro zonu se ztrati zoneName a labelColor -> zoneName spravne v metadatech -> nastavim tedy i labelColor a Labler na to koukne, pokud se pridalo shape s labelColor
i zoneName a kdyztak prida novy label. -> ve vysledku asi nerelevantni -> nejak udelat composite command na label + add shape? UndoRedoManager metoda na mergeLastN?
Moznost udelat to jinak lepe, nez pZone Nameoslat undoRedoManager do ShapeModal?
Undo/Redo i pro zmenu jmena zony?
Vysvetlit zmenu v ShapeManageru z HistoryManaged funkci na to, ze ty funkce vrati command -> dovoli nam to vytvaret composite commandy.
Note: Nezapomenout udelat load/save pro FurnitureEditor.
Kdyz je vice ShapeManageru, mel bych se snazit vyresit duplicitni ID? Pouzivam defaultne UUID, takze by to nemel byt problem? -> priklad shapeDeleteRequested.

Kdyz v UndoRedoManageru clearnu undoStack, co udelat, kdyz tam byl napr. RemoveCommand, ktery by restornul nejaky tvar -> leakujeme memory, protoze uz pak neni kdo by to restornul.

Corner unselect
