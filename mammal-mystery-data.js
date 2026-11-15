/* ============================================================
   MAMMAL MYSTERY: the animals, clues, and facts.
   Everything here is read aloud in the game, so write it the way
   you would say it to a young child.

   clue types:  part   -> zoom in on that body part of the hidden animal
                hab    -> show a habitat picture
                teeth  -> show the teeth
                food   -> show what it eats (meat, plants, both)
                shadow -> show the whole animal as a dark shadow
   grade keys:  pk = Pre-K, k = Kindergarten, g1 = 1st grade, g2 = 2nd grade

   PHOTOS: put a real photo in assets/mammal-mystery/photos/ and fill in
   src and credit here. Use only photos you took or ones with an open
   license (public domain, CC0, CC BY, CC BY-SA), and credit them exactly.
   Until a photo is added, the case file shows the cartoon instead.
   ============================================================ */
(function () {
  const PHOTOS = {
    otter:     { src: "assets/mammal-mystery/photos/otter.jpg", credit: 'Photo: Dmitry Azovtsev (<a href="http://www.daphoto.info" target="_blank" rel="noopener">daphoto.info</a>), <a href="https://creativecommons.org/licenses/by-sa/3.0" target="_blank" rel="noopener">CC BY-SA 3.0</a>, via <a href="https://commons.wikimedia.org/wiki/File:LutraCanadensis_fullres.jpg" target="_blank" rel="noopener">Wikimedia Commons</a>' },
    raccoon:   { src: "", credit: "" },
    fox:       { src: "", credit: "" },
    lion:      { src: "", credit: "" },
    polarbear: { src: "", credit: "" },
    panda:     { src: "", credit: "" },
    meerkat:   { src: "", credit: "" },
    rabbit:    { src: "", credit: "" },
    kangaroo:  { src: "", credit: "" },
    elephant:  { src: "", credit: "" },
    giraffe:   { src: "", credit: "" },
    camel:     { src: "", credit: "" },
  };

  const ANIMALS = {
    otter: {
      name: "river otter", where: "North America", hab: "river", diet: "meat", group: "carnivoran",
      clues: {
        pk: [["part", "tail", "I have a long, strong tail."], ["part", "whiskers", "I have lots of whiskers."], ["part", "fur", "I am brown and sleek."], ["shadow", "", "Here is my shadow!"]],
        k:  [["part", "paws", "My webbed feet help me swim."], ["part", "whiskers", "My whiskers feel for fish in muddy water."], ["part", "tail", "My strong tail pushes me through the water."], ["part", "ears", "My ears are tiny so water stays out."]],
        g1: [["hab", "river", "I live in rivers, lakes, and marshes."], ["part", "paws", "My webbed feet make me a fast swimmer."], ["part", "fur", "My thick fur keeps me warm in cold water."], ["part", "whiskers", "My whiskers feel for fish."]],
        g2: [["food", "meat", "I eat fish, crayfish, and frogs."], ["teeth", "", "Look at my teeth: pointy, for grabbing slippery fish."], ["hab", "river", "I live in North American rivers."], ["part", "paws", "I have webbed feet."]],
      },
      facts: {
        pk: ["Otters love to swim and play.", "Otters slide down muddy hills for fun!"],
        k:  ["Otters have webbed feet, like flippers, for swimming.", "Their long whiskers help them feel for fish.", "Otters can close their ears and nose underwater."],
        g1: ["River otters live in rivers, lakes, and marshes in North America.", "Their thick fur traps air, which keeps them warm and dry.", "They dig dens in riverbanks to sleep and raise their pups.", "Scientists at the SQuEACs Lab study river otter skulls and brains!"],
        g2: ["Otters eat fish, crayfish, and frogs, so they are carnivores.", "Their sharp, pointy teeth grab and crunch slippery prey.", "Otters belong to the weasel family. In this game, their closest cousin is the raccoon.", "The SQuEACs Lab compares otters from many places to see how their bodies fit their homes."],
      },
      partWhy: { paws: "webbed feet for swimming", whiskers: "whiskers to feel for fish", tail: "a strong tail for swimming", ears: "small ears that close underwater" },
    },
    raccoon: {
      name: "raccoon", where: "North and Central America", hab: "forest", diet: "both", group: "carnivoran",
      clues: {
        pk: [["part", "tail", "My tail has stripes, like rings!"], ["part", "fur", "I am gray and fuzzy."], ["part", "eyes", "I wear a black mask around my eyes."], ["shadow", "", "Here is my shadow!"]],
        k:  [["part", "paws", "My front paws work almost like hands."], ["part", "eyes", "I have a black mask around my eyes."], ["part", "tail", "My bushy tail has black rings."], ["part", "ears", "My pointy ears hear sounds at night."]],
        g1: [["hab", "forest", "I live in forests, and even in cities."], ["part", "paws", "My clever paws climb trees and open things."], ["part", "eyes", "I have a black mask and come out at night."], ["part", "tail", "My tail has black rings."]],
        g2: [["food", "both", "I eat almost anything: fruit, nuts, bugs, eggs, and fish."], ["teeth", "", "Look at my teeth: pointy in front, bumpy in back, for many kinds of food."], ["part", "paws", "My front paws feel and grab like hands."], ["part", "tail", "My tail has black rings."]],
      },
      facts: {
        pk: ["Raccoons wear a black mask around their eyes.", "Their tails have stripes, like rings."],
        k:  ["Raccoons have front paws that work almost like hands.", "They have a black mask and a ringed tail.", "Raccoons are awake mostly at night."],
        g1: ["Raccoons live in forests and in cities in North and Central America.", "They are great climbers and sleep in tree holes.", "Their paws can feel food even underwater.", "The SQuEACs Lab has a 3D model of a raccoon's brain case on its website."],
        g2: ["Raccoons eat plants and animals, so they are omnivores.", "Pointy front teeth and bumpy back teeth let them eat many foods.", "Raccoons belong to the carnivoran group. Their closest cousin in this game is the otter.", "Scientists measure raccoon brains to learn how smart, curious animals are built."],
      },
      partWhy: { paws: "clever paws that work like hands", eyes: "eyes with a black mask", tail: "a ringed tail", ears: "pointy ears that hear at night" },
    },
    fox: {
      name: "red fox", where: "North America, Europe, Asia, and North Africa", hab: "forest", diet: "both", group: "carnivoran",
      clues: {
        pk: [["part", "fur", "I am bright orange!"], ["part", "tail", "My big fluffy tail has a white tip."], ["part", "ears", "I have big pointy ears."], ["shadow", "", "Here is my shadow!"]],
        k:  [["part", "ears", "My big pointy ears can hear a mouse under the snow."], ["part", "tail", "My fluffy tail keeps my nose warm when I sleep."], ["part", "paws", "My feet look like I'm wearing black socks."], ["part", "nose", "My nose sniffs out food."]],
        g1: [["hab", "forest", "I live in forests, fields, and even towns."], ["part", "ears", "I hunt by listening with my big ears."], ["part", "tail", "My bushy tail is like a warm blanket."], ["part", "fur", "My fur is bright orange."]],
        g2: [["food", "both", "I eat mice, rabbits, bugs, and berries."], ["teeth", "", "Look at my teeth: sharp in front, bumpy in back."], ["part", "ears", "My ears can hear a mouse under the snow."], ["part", "tail", "I'm in the dog family, with a big bushy tail."]],
      },
      facts: {
        pk: ["Foxes have big fluffy tails.", "Foxes have big pointy ears."],
        k:  ["A fox can hear a mouse squeak under the snow.", "Foxes curl their fluffy tails over their noses to stay warm.", "Red foxes have black fur on their legs, like socks."],
        g1: ["Red foxes live in more places than any other wild carnivore.", "You can find them in forests, fields, and towns in North America, Europe, Asia, and North Africa.", "Foxes pounce! They jump high and land on their food."],
        g2: ["Foxes eat animals and plants, so they are omnivores.", "They are in the dog family, with wolves and coyotes.", "Foxes are carnivorans, cousins of otters, raccoons, and bears.", "Their sharp front teeth catch mice, and their bumpy back teeth chew berries."],
      },
      partWhy: { ears: "big ears that hear mice", tail: "a fluffy tail like a blanket", paws: "black socks on its feet", nose: "a nose that sniffs out food" },
    },
    lion: {
      name: "lion", where: "Africa and India", hab: "grassland", diet: "meat", group: "carnivoran",
      clues: {
        pk: [["part", "mane", "I have a big fluffy mane around my head!"], ["part", "fur", "I am golden, like sand."], ["part", "tail", "My tail has a fuzzy tip."], ["shadow", "", "Here is my shadow!"]],
        k:  [["part", "mane", "My big mane makes me look large and strong."], ["part", "tail", "My long tail has a dark tuft at the end."], ["part", "paws", "I hide sharp claws inside my big paws."], ["part", "mouth", "I can roar very, very loudly!"]],
        g1: [["hab", "grassland", "I live on the grassy savanna."], ["part", "fur", "My sandy fur hides me in tall, dry grass."], ["part", "mane", "Males like me have a big mane."], ["part", "tail", "My tail has a dark tuft."]],
        g2: [["food", "meat", "I eat zebras and antelope."], ["teeth", "", "Look at my teeth: big fangs and sharp, scissor-like back teeth."], ["hab", "grassland", "I live on the African savanna."], ["part", "mane", "I'm in the cat family, and I have a mane."]],
      },
      facts: {
        pk: ["Lions roar very loudly.", "Boy lions have a big fluffy mane."],
        k:  ["Lions hide their sharp claws inside their paws until they need them.", "A lion's roar can be heard far, far away.", "Lion cubs have spots when they are little!"],
        g1: ["Lions live on the grassy savanna in Africa, and a few live in a forest in India.", "Their sandy fur blends in with dry grass.", "Lions live in family groups called prides."],
        g2: ["Lions eat other animals, so they are carnivores.", "Their back teeth work like scissors to slice meat.", "Lions are in the cat family. Their closest cousin in this game is the meerkat!", "Lions and pet cats share a great-great-grandparent from long ago."],
      },
      partWhy: { mane: "a big mane", fur: "sandy fur that hides in grass", tail: "a tail with a tuft", paws: "paws that hide sharp claws", mouth: "a mouth that roars" },
    },
    polarbear: {
      name: "polar bear", where: "the Arctic", hab: "ice", diet: "meat", group: "carnivoran",
      clues: {
        pk: [["part", "fur", "I am white, like snow!"], ["part", "paws", "I have big, big paws."], ["part", "ears", "I have small round ears."], ["shadow", "", "Here is my shadow!"]],
        k:  [["part", "paws", "My giant paws are like snowshoes on the ice."], ["part", "fur", "My thick white fur keeps me warm."], ["part", "ears", "My ears are small so they don't get too cold."], ["part", "nose", "My nose can smell food from far away."]],
        g1: [["hab", "ice", "I live on the ice near the top of the world."], ["part", "fur", "I have thick white fur, and black skin underneath."], ["part", "paws", "My big paws help me walk on ice and swim."], ["part", "ears", "My small ears stay warm."]],
        g2: [["food", "meat", "I hunt seals."], ["teeth", "", "Look at my teeth: big fangs and jagged back teeth."], ["hab", "ice", "I live on the Arctic sea ice."], ["part", "fur", "I'm in the bear family, with white fur."]],
      },
      facts: {
        pk: ["Polar bears live where it is cold and icy.", "Polar bears are great swimmers."],
        k:  ["Polar bears have giant paws, like snowshoes.", "Thick fur and fat keep them warm.", "Their small ears lose less heat in the cold."],
        g1: ["Polar bears live on the sea ice of the Arctic, at the top of the world.", "Under their white fur, their skin is black!", "They can swim for many hours in icy water."],
        g2: ["Polar bears hunt seals, so they are carnivores.", "They are the biggest meat-eaters that live on land.", "Polar bears are in the bear family. Their closest cousin in this game is the giant panda.", "As sea ice melts, polar bears have a harder time finding food."],
      },
      partWhy: { paws: "giant paws like snowshoes", fur: "thick white fur", ears: "small ears that stay warm", nose: "a nose that smells far away" },
    },
    panda: {
      name: "giant panda", where: "China", hab: "forest", diet: "plants", group: "carnivoran",
      clues: {
        pk: [["part", "fur", "I am black and white!"], ["part", "eyes", "I have black patches around my eyes."], ["part", "ears", "My round ears are black."], ["shadow", "", "Here is my shadow!"]],
        k:  [["part", "eyes", "I have black patches around my eyes."], ["part", "paws", "A special bump on my paw works like a thumb."], ["part", "ears", "My round ears are black."], ["part", "fur", "My fur is black and white."]],
        g1: [["hab", "forest", "I live in cool, misty bamboo forests in the mountains."], ["part", "paws", "I hold bamboo with a special thumb-like bump."], ["part", "fur", "I am black and white."], ["part", "eyes", "I have black eye patches."]],
        g2: [["food", "plants", "I eat bamboo almost all day long."], ["teeth", "", "Look at my teeth: big, flat back teeth crush tough bamboo."], ["part", "paws", "A thumb-like bump on my paw holds bamboo."], ["part", "fur", "I'm in the bear family, and I'm black and white."]],
      },
      facts: {
        pk: ["Giant pandas are black and white.", "Pandas love to eat bamboo."],
        k:  ["Pandas have a bump on their wrist that works like a thumb.", "They use it to hold bamboo while they eat.", "Pandas eat for about half of the day!"],
        g1: ["Giant pandas live in cool, misty bamboo forests in the mountains of China.", "They climb trees to rest and stay safe.", "A baby panda is about as small as a stick of butter."],
        g2: ["Pandas eat almost only bamboo, so they eat like herbivores.", "Surprise: pandas belong to the carnivoran group, with lions and foxes!", "Their big, flat back teeth crush tough bamboo.", "Pandas are bears. Their closest cousin in this game is the polar bear."],
      },
      partWhy: { eyes: "black eye patches", paws: "a thumb-like bump to hold bamboo", ears: "round black ears", fur: "black and white fur" },
    },
    meerkat: {
      name: "meerkat", where: "southern Africa", hab: "desert", diet: "meat", group: "carnivoran",
      clues: {
        pk: [["part", "eyes", "I have dark circles around my eyes."], ["part", "paws", "I stand up tall to look around!"], ["part", "tail", "My skinny tail has a dark tip."], ["shadow", "", "Here is my shadow!"]],
        k:  [["part", "claws", "My long claws dig tunnels."], ["part", "eyes", "Dark patches around my eyes help in bright sun."], ["part", "tail", "My skinny tail helps me balance when I stand."], ["part", "ears", "My small ears close when I dig."]],
        g1: [["hab", "desert", "I live in hot, dry, sandy places."], ["part", "claws", "My claws dig cool tunnels to sleep in."], ["part", "eyes", "Dark eye patches block the bright sun."], ["part", "tail", "I stand on my back legs to watch for danger."]],
        g2: [["food", "meat", "I eat bugs, scorpions, and lizards."], ["teeth", "", "Look at my teeth: small and pointy, for crunching bugs."], ["hab", "desert", "I live in the deserts of southern Africa."], ["part", "claws", "I'm in the mongoose family, with long digging claws."]],
      },
      facts: {
        pk: ["Meerkats stand up tall to look around.", "Meerkats live in big families."],
        k:  ["Meerkats have long claws for digging.", "Dark patches around their eyes help them see in bright sun.", "Their skinny tail helps them balance when they stand up."],
        g1: ["Meerkats live in dry deserts and grasslands in southern Africa.", "They dig tunnels to stay cool and safe.", "One meerkat stands guard and calls out when danger comes."],
        g2: ["Meerkats eat mostly bugs, scorpions, and lizards. Bugs are animals, so meerkats are carnivores.", "Meerkats are in the mongoose family.", "They are on the cat branch of the carnivorans. Their closest cousin in this game is the lion!"],
      },
      partWhy: { claws: "long claws for digging", eyes: "dark eye patches", tail: "a skinny tail for balance", ears: "small ears that close" },
    },
    rabbit: {
      name: "rabbit", where: "many parts of the world", hab: "grassland", scene: "meadow", diet: "plants", group: "other",
      clues: {
        pk: [["part", "ears", "I have long, long ears!"], ["part", "tail", "I have a puffy white tail."], ["part", "mouth", "I have two big front teeth."], ["shadow", "", "Here is my shadow!"]],
        k:  [["part", "ears", "My long ears turn to catch sounds."], ["part", "mouth", "My front teeth never stop growing."], ["part", "tail", "My fluffy tail looks like a cotton ball."], ["part", "nose", "My nose wiggles when I sniff."]],
        g1: [["hab", "grassland", "I live in fields and meadows."], ["part", "ears", "My long ears hear danger coming."], ["part", "paws", "My strong back feet help me hop fast."], ["part", "tail", "I have a puffy tail."]],
        g2: [["food", "plants", "I eat grass, clover, and leaves."], ["teeth", "", "Look at my teeth: big front teeth for snipping and flat back teeth for grinding."], ["part", "ears", "I have long ears."], ["part", "mouth", "My front teeth never stop growing."]],
      },
      facts: {
        pk: ["Rabbits hop, hop, hop!", "Rabbits have long ears and a puffy tail."],
        k:  ["A rabbit's long ears can turn to catch sounds.", "Their front teeth never stop growing.", "A rabbit's nose wiggles when it sniffs."],
        g1: ["Wild rabbits live in fields and meadows in many parts of the world.", "They dig tunnels called burrows.", "Strong back legs help them hop away from danger."],
        g2: ["Rabbits eat grass and leaves, so they are herbivores.", "Chewing tough grass wears down their teeth, which keep growing.", "Rabbits are not rodents, but they are cousins of mice and squirrels."],
      },
      partWhy: { ears: "long ears that turn", mouth: "front teeth that keep growing", tail: "a puffy tail", nose: "a wiggly nose", paws: "strong feet for hopping" },
    },
    kangaroo: {
      name: "kangaroo", where: "Australia", hab: "grassland", scene: "outback", diet: "plants", group: "marsupial",
      clues: {
        pk: [["part", "paws", "I have big, long feet for jumping!"], ["part", "pouch", "I have a pocket for my baby."], ["part", "tail", "My tail is big and thick."], ["shadow", "", "Here is my shadow!"]],
        k:  [["part", "pouch", "My baby rides in a pouch on my belly."], ["part", "paws", "My long feet help me jump far."], ["part", "tail", "My thick tail helps me balance."], ["part", "ears", "My tall ears can turn to listen."]],
        g1: [["hab", "grassland", "I live in dry, open grasslands of Australia."], ["part", "paws", "I hop very fast on my long feet."], ["part", "pouch", "My baby grows in my pouch."], ["part", "tail", "My tail is like an extra leg."]],
        g2: [["food", "plants", "I eat grass and leaves."], ["teeth", "", "Look at my teeth: long front teeth and flat back teeth for grinding grass."], ["part", "pouch", "I'm a marsupial: my baby grows in a pouch."], ["hab", "grassland", "I live in Australia."]],
      },
      facts: {
        pk: ["Kangaroos jump with their big feet.", "A baby kangaroo is called a joey."],
        k:  ["Mother kangaroos carry their joey in a pouch.", "Their thick tail helps them balance.", "Kangaroos can't walk backward!"],
        g1: ["Red kangaroos live in the dry grasslands of Australia.", "They hop very fast across open land.", "They rest in the shade when the day is hot."],
        g2: ["Kangaroos eat grass and leaves, so they are herbivores.", "Kangaroos are marsupials: their babies are born tiny and grow in a pouch.", "That makes them the most distant cousin of every other animal in this game."],
      },
      partWhy: { pouch: "a pouch for its joey", paws: "long feet for jumping", tail: "a thick tail for balance", ears: "tall ears that turn" },
    },
    elephant: {
      name: "elephant", where: "Africa", hab: "grassland", diet: "plants", group: "other",
      clues: {
        pk: [["part", "trunk", "I have a long, long nose!"], ["part", "ears", "My ears are giant!"], ["part", "fur", "I am big and gray."], ["shadow", "", "Here is my shadow!"]],
        k:  [["part", "trunk", "My trunk can smell, grab, and spray water."], ["part", "ears", "I flap my giant ears to cool off."], ["part", "tusks", "My tusks are very long teeth."], ["part", "paws", "My wide feet hold up my heavy body."]],
        g1: [["hab", "grassland", "I live on the savanna and in forests."], ["part", "ears", "I flap my giant ears to stay cool in the heat."], ["part", "trunk", "My trunk sprays water and dust on my back."], ["part", "tusks", "I dig for water with my tusks."]],
        g2: [["food", "plants", "I eat grass, leaves, bark, and fruit."], ["teeth", "", "Look at my teeth: giant flat back teeth with ridges, and tusks."], ["part", "trunk", "My trunk is my nose and lip together."], ["hab", "grassland", "I live in Africa."]],
      },
      facts: {
        pk: ["Elephants are the biggest animals on land.", "An elephant's nose is called a trunk."],
        k:  ["An elephant's trunk can smell, grab, and spray water.", "Elephants flap their giant ears to cool off.", "Tusks are very long front teeth."],
        g1: ["African elephants live on the savanna and in forests in Africa.", "They spray water and dust on their backs to stay cool.", "Elephant families are led by the oldest grandmother."],
        g2: ["Elephants eat grass, leaves, bark, and fruit, so they are herbivores.", "Their huge flat back teeth grind plants, and new teeth move in as old ones wear out.", "Their cousins include manatees, believe it or not!"],
      },
      partWhy: { trunk: "a long trunk", ears: "giant ears that flap to cool off", tusks: "tusks, which are long teeth", paws: "wide feet" },
    },
    giraffe: {
      name: "giraffe", where: "Africa", hab: "grassland", diet: "plants", group: "hoofed",
      clues: {
        pk: [["part", "neck", "I have a very long neck!"], ["part", "fur", "I have brown patches all over."], ["part", "horns", "I have two little bumps on my head."], ["shadow", "", "Here is my shadow!"]],
        k:  [["part", "neck", "My long neck reaches high leaves."], ["part", "horns", "I have two horn-like bumps called ossicones."], ["part", "hooves", "I walk on hooves."], ["part", "fur", "My patches are like no one else's."]],
        g1: [["hab", "grassland", "I live on the savanna, with trees here and there."], ["part", "neck", "My long neck reaches leaves no one else can."], ["part", "fur", "My patchy fur hides me in the shade of trees."], ["part", "hooves", "I run on long legs with hooves."]],
        g2: [["food", "plants", "I eat leaves, especially from acacia trees."], ["teeth", "", "Look at my teeth: flat back teeth, for grinding leaves."], ["part", "hooves", "I have hooves with two toes."], ["part", "neck", "I have a very long neck."]],
      },
      facts: {
        pk: ["Giraffes are the tallest animals in the world.", "Giraffes have long necks."],
        k:  ["A giraffe's long neck reaches leaves high in trees.", "The bumps on its head are called ossicones.", "Every giraffe has its own patch pattern."],
        g1: ["Giraffes live on the savanna in Africa.", "Their long necks reach leaves that other animals can't.", "Giraffes sleep for only a short time each day."],
        g2: ["Giraffes eat leaves, so they are herbivores.", "Their long tongue wraps around thorny branches.", "Giraffes have hooves with two toes. Their closest cousin in this game is the camel."],
      },
      partWhy: { neck: "a very long neck", horns: "two ossicones", hooves: "hooves", fur: "patchy fur" },
    },
    camel: {
      name: "camel", where: "North Africa and the Middle East", hab: "desert", diet: "plants", group: "hoofed",
      clues: {
        pk: [["part", "hump", "I have a big hump on my back!"], ["part", "fur", "I am tan, like sand."], ["part", "neck", "I have a long, bendy neck."], ["shadow", "", "Here is my shadow!"]],
        k:  [["part", "hump", "My hump stores fat, not water."], ["part", "paws", "My wide feet don't sink in sand."], ["part", "neck", "My bendy neck reaches plants."], ["part", "nose", "I can close my nose in a sandstorm."]],
        g1: [["hab", "desert", "I live in hot, sandy deserts."], ["part", "hump", "My hump stores fat for long trips."], ["part", "paws", "My wide, soft feet walk on sand."], ["part", "nose", "I close my nose to keep sand out."]],
        g2: [["food", "plants", "I eat dry grass, leaves, and even thorny plants."], ["teeth", "", "Look at my teeth: flat back teeth for chewing tough plants."], ["part", "hump", "I have one hump."], ["hab", "desert", "I live in the desert."]],
      },
      facts: {
        pk: ["Camels have a big hump.", "Camels live where it is hot and sandy."],
        k:  ["A camel's hump stores fat, not water.", "Long eyelashes keep sand out of its eyes.", "Wide feet keep it from sinking in sand."],
        g1: ["Camels with one hump live in hot deserts in North Africa and the Middle East.", "They can go many days without drinking.", "They can close their noses in a sandstorm."],
        g2: ["Camels eat dry grass, leaves, and thorny plants, so they are herbivores.", "They chew their food twice, called chewing cud.", "Camels have two toes on each foot. Their closest cousin in this game is the giraffe."],
      },
      partWhy: { hump: "a hump that stores fat", paws: "wide feet for sand", neck: "a bendy neck", nose: "a nose that closes" },
    },
    /* ---------- Level 2: surprising mammals (unlocked after all 12 above are found) ---------- */
    redpanda: {
      name: "red panda", where: "the mountains of Asia", hab: "mountain", diet: "plants", group: "carnivoran", level: 2,
      clues: {
        pk: [["part", "tail", "I have a big, fluffy, striped tail."], ["part", "ears", "My pointy ears have white edges."], ["part", "fur", "My fur is red, like a fox."], ["shadow", "", "Here is my shadow!"]],
        k:  [["part", "tail", "I wrap my fluffy tail around me like a blanket."], ["part", "ears", "My ears are white around the edges."], ["part", "eyes", "I have red stripes under my eyes, like tears."], ["part", "paws", "My paws have furry bottoms, like snow boots."]],
        g1: [["hab", "mountain", "I live in cool, misty mountain forests."], ["part", "tail", "My ringed tail keeps me warm when I sleep."], ["part", "paws", "My furry feet grip icy tree branches."], ["part", "fur", "My red fur hides me in red, mossy trees."]],
        g2: [["food", "plants", "I eat mostly bamboo leaves."], ["teeth", "", "Look at my teeth: bumpy back teeth for crunching bamboo."], ["hab", "mountain", "I live in the mountains of Asia."], ["part", "tail", "I have a ringed tail."]],
      },
      facts: {
        pk: ["Red pandas love to climb trees.", "They sleep curled up in their fluffy tails."],
        k:  ["Red pandas use their tails like a blanket.", "Their furry feet keep their toes warm in the snow.", "They eat bamboo, just like giant pandas."],
        g1: ["Red pandas live in cool mountain forests in Asia.", "They spend most of their time up in trees.", "A wrist bone works like an extra thumb to hold bamboo.", "Surprise: the red panda was named panda before the giant panda was!"],
        g2: ["Red pandas eat mostly bamboo, so they are herbivores, even though they are carnivorans.", "Their bumpy back teeth crush tough bamboo leaves.", "They are not bears and not giant pandas. They are on their own branch, closest to raccoons, skunks, and weasels.", "They have to eat for about 13 hours a day, because bamboo has very little energy."],
      },
      partWhy: { tail: "a fluffy tail to stay warm", ears: "ears with white edges", eyes: "red tear stripes under their eyes", paws: "furry feet like snow boots", fur: "red fur" },
    },
    sloth: {
      name: "sloth", where: "Central and South America", hab: "rainforest", diet: "plants", group: "other", level: 2,
      clues: {
        pk: [["part", "claws", "I have long, curved claws."], ["part", "eyes", "I have dark patches around my eyes."], ["part", "fur", "My fur is shaggy and brown."], ["shadow", "", "Here is my shadow!"]],
        k:  [["part", "claws", "My long claws are hooks for hanging upside down."], ["part", "eyes", "Dark stripes go across my eyes."], ["part", "mouth", "My face looks like it is always smiling."], ["part", "paws", "I can hang from a branch with my feet."]],
        g1: [["hab", "rainforest", "I live high in rainforest trees."], ["part", "claws", "My hooked claws hold on, even when I sleep."], ["part", "fur", "Tiny green plants grow in my fur and hide me."], ["part", "eyes", "I move so slowly that hawks hardly notice me."]],
        g2: [["food", "plants", "I eat leaves, twigs, and buds."], ["teeth", "", "Look at my teeth: no front teeth, just flat pegs for mashing leaves."], ["hab", "rainforest", "I live in the rainforests of Central and South America."], ["part", "claws", "I have long hooked claws."]],
      },
      facts: {
        pk: ["Sloths hang upside down in trees.", "Sloths move very, very slowly."],
        k:  ["Sloths use their long claws like hooks.", "They sleep hanging from branches.", "Sloths are great swimmers!"],
        g1: ["Sloths live in the rainforest trees of Central and South America.", "Little green plants called algae grow in their fur and help them hide.", "They come down from their tree only about once a week, to go potty.", "Sloths can hold their breath underwater for a long time."],
        g2: ["Sloths eat leaves, so they are herbivores.", "They have no front teeth. Their flat peg teeth keep growing all their life.", "Their closest cousins are armadillos and anteaters.", "Leaves give very little energy, so sloths save energy by moving slowly."],
      },
      partWhy: { claws: "long hooked claws for hanging", eyes: "dark stripes across their eyes", mouth: "a smiley mouth", paws: "feet that can hang on to branches", fur: "shaggy fur where little plants grow" },
    },
    armadillo: {
      name: "armadillo", where: "North, Central, and South America", hab: "grassland", diet: "both", group: "other", level: 2,
      clues: {
        pk: [["part", "shell", "I wear a hard shell, like armor."], ["part", "ears", "I have tall ears."], ["part", "nose", "My long nose sniffs the ground."], ["shadow", "", "Here is my shadow!"]],
        k:  [["part", "shell", "My shell is made of bony bands."], ["part", "nose", "My long nose sniffs out bugs underground."], ["part", "claws", "My strong claws dig fast."], ["part", "tail", "Even my tail has armor."]],
        g1: [["hab", "grassland", "I live in grasslands and scrubby woods."], ["part", "shell", "My armor shell protects me from coyotes."], ["part", "claws", "My claws dig burrows to sleep in."], ["part", "nose", "My nose smells bugs under the dirt."]],
        g2: [["food", "both", "I eat bugs, worms, and a little fruit."], ["teeth", "", "Look at my teeth: no front teeth, just small pegs."], ["hab", "grassland", "I live in the Americas."], ["part", "shell", "I have a shell of bony bands."]],
      },
      facts: {
        pk: ["Armadillos wear a hard shell.", "They dig holes with their claws."],
        k:  ["An armadillo's shell is made of bone covered with tough skin.", "They sniff for bugs with their long noses.", "Some armadillos can roll into a ball!"],
        g1: ["Armadillos live in grasslands and woods in the Americas.", "They dig burrows to sleep in and stay cool.", "The armadillo's name means little armored one in Spanish.", "They can hold their breath and walk across the bottom of a stream."],
        g2: ["Armadillos eat insects and worms plus some fruit, so they are omnivores.", "They have no front teeth, just small peg teeth.", "Their closest cousins are sloths and anteaters.", "Nine-banded armadillos almost always have four identical babies!"],
      },
      partWhy: { shell: "a hard shell of bony bands", nose: "a long nose for sniffing bugs", claws: "strong claws for digging", tail: "an armored tail", ears: "tall ears" },
    },
    platypus: {
      name: "platypus", where: "eastern Australia", hab: "river", diet: "meat", group: "monotreme", level: 2,
      clues: {
        pk: [["part", "bill", "I have a bill, like a duck."], ["part", "tail", "I have a flat tail, like a beaver."], ["part", "paws", "I have webbed feet."], ["shadow", "", "Here is my shadow!"]],
        k:  [["part", "bill", "My soft bill feels for food underwater."], ["part", "paws", "My webbed front feet paddle me along."], ["part", "tail", "My flat tail stores fat for later."], ["part", "eyes", "I close my eyes when I dive."]],
        g1: [["hab", "river", "I live in rivers and streams in Australia."], ["part", "bill", "My bill feels the tiny zaps from animals moving underwater."], ["part", "paws", "My webbed feet are great for swimming."], ["part", "fur", "My thick fur keeps me warm and dry."]],
        g2: [["food", "meat", "I eat insect larvae, worms, and shrimp."], ["teeth", "", "Look at my mouth: grown-ups have no teeth! I mash food with hard pads."], ["hab", "river", "I live in rivers in eastern Australia."], ["part", "bill", "I have a bill like a duck."]],
      },
      facts: {
        pk: ["The platypus has a bill like a duck.", "The platypus lays eggs!"],
        k:  ["The platypus is a mammal that lays eggs.", "It finds food with its bill, even with its eyes closed.", "It has webbed feet for swimming."],
        g1: ["Platypuses live in rivers and streams in eastern Australia.", "They dive with their eyes, ears, and nose closed.", "Their bill senses tiny electric signals from animals underwater.", "Babies hatch from eggs, then drink their mother's milk."],
        g2: ["Platypuses eat insect larvae, worms, and shrimp, so they are carnivores.", "Grown-ups have no teeth. They mash food with hard pads in their bill.", "Monotremes, the egg-laying mammals, branched off the mammal family tree before all others.", "Males have a venom spur on their back legs!"],
      },
      partWhy: { bill: "a bill that feels for food", paws: "webbed feet for swimming", tail: "a flat tail that stores fat", eyes: "eyes that close underwater", fur: "thick waterproof fur" },
    },
    hedgehog: {
      name: "hedgehog", where: "Europe, Africa, and Asia", hab: "grassland", scene: "meadow", diet: "meat", group: "other", level: 2,
      clues: {
        pk: [["part", "spines", "I am covered in spikes."], ["part", "nose", "I have a pointy nose."], ["part", "ears", "I have little round ears."], ["shadow", "", "Here is my shadow!"]],
        k:  [["part", "spines", "My spikes are called spines."], ["part", "nose", "My nose sniffs out bugs and worms."], ["part", "ears", "I hear bugs crawling in the leaves."], ["part", "paws", "I have tiny feet."]],
        g1: [["hab", "grassland", "I live in meadows, hedges, and gardens."], ["part", "spines", "When I'm scared, I roll into a spiky ball."], ["part", "nose", "I sniff for food at night."], ["part", "fur", "My tummy is soft and furry."]],
        g2: [["food", "meat", "I eat beetles, worms, and snails."], ["teeth", "", "Look at my teeth: lots of small, sharp teeth for crunching bugs."], ["hab", "grassland", "I live in Europe, Africa, and Asia."], ["part", "spines", "I am covered in spines."]],
      },
      facts: {
        pk: ["Hedgehogs are covered in spikes.", "Hedgehogs roll into a ball to stay safe."],
        k:  ["A hedgehog has about 5,000 spines.", "It rolls into a spiky ball when it is scared.", "Hedgehogs look for food at night."],
        g1: ["Hedgehogs live in meadows, hedges, and gardens.", "They got their name because they snuffle and grunt like a pig in the hedges.", "Some hedgehogs sleep all winter.", "Baby hedgehogs are called hoglets!"],
        g2: ["Hedgehogs eat beetles, worms, and snails, so they are carnivores. They are insect eaters.", "Their small, sharp teeth crunch hard bug shells.", "Their spines are hairs that became stiff and hollow.", "They are cousins of shrews and moles, on the Laurasian branch."],
      },
      partWhy: { spines: "spines to stay safe", nose: "a pointy nose for sniffing", ears: "little ears that hear bugs", paws: "tiny feet", fur: "a soft furry tummy" },
    },
    bat: {
      name: "fruit bat", where: "Africa, Asia, and Australia", hab: "rainforest", diet: "plants", group: "other", level: 2,
      clues: {
        pk: [["part", "wings", "I have big wings."], ["part", "ears", "I have pointy ears."], ["part", "eyes", "I have big dark eyes."], ["shadow", "", "Here is my shadow!"]],
        k:  [["part", "wings", "My wings are made of skin stretched over my fingers."], ["part", "claws", "I have a little claw on each thumb."], ["part", "eyes", "My big eyes help me see at night."], ["part", "paws", "My feet hang on upside down."]],
        g1: [["hab", "rainforest", "I live in rainforests and fly at night."], ["part", "wings", "I am the only mammal that can really fly."], ["part", "nose", "My nose sniffs out ripe fruit."], ["part", "paws", "I sleep hanging upside down by my feet."]],
        g2: [["food", "plants", "I eat fruit and flower nectar."], ["teeth", "", "Look at my teeth: pointy front teeth to bite fruit, flat back teeth to mash it."], ["hab", "rainforest", "I live in forests in Africa, Asia, and Australia."], ["part", "wings", "My wings are made of skin."]],
      },
      facts: {
        pk: ["Bats can fly!", "Bats sleep hanging upside down."],
        k:  ["A bat's wing is its hand, with long fingers and skin in between.", "Fruit bats use their eyes and noses to find fruit.", "They sleep upside down in big groups."],
        g1: ["Fruit bats live in warm forests in Africa, Asia, and Australia.", "Bats are the only mammals that can really fly.", "Some fruit bats have wings wider than a grown-up's arms.", "Fruit bats are also called flying foxes!"],
        g2: ["Fruit bats eat fruit and nectar, so they are herbivores.", "They drop seeds as they fly, which plants new trees.", "There are over 1,400 kinds of bats: about one of every five kinds of mammal!", "Bats are on the Laurasian branch, cousins of carnivorans and hoofed animals."],
      },
      partWhy: { wings: "wings made of skin and fingers", claws: "a thumb claw for climbing", eyes: "big eyes for seeing at night", paws: "feet that hang upside down", nose: "a nose that sniffs fruit", ears: "pointy ears" },
    },
    koala: {
      name: "koala", where: "eastern Australia", hab: "forest", diet: "plants", group: "marsupial", level: 2,
      clues: {
        pk: [["part", "ears", "I have big fluffy ears."], ["part", "nose", "I have a big black nose."], ["part", "fur", "My fur is soft and gray."], ["shadow", "", "Here is my shadow!"]],
        k:  [["part", "nose", "My big nose sniffs which leaves are safe to eat."], ["part", "ears", "My ears are round and fluffy."], ["part", "claws", "My sharp claws grip tree bark."], ["part", "paws", "I have two thumbs on each front paw."]],
        g1: [["hab", "forest", "I live in eucalyptus forests in Australia."], ["part", "claws", "My claws help me climb tall trees."], ["part", "nose", "I sniff leaves to pick the best ones."], ["part", "fur", "My thick fur is like a raincoat."]],
        g2: [["food", "plants", "I eat only eucalyptus leaves."], ["teeth", "", "Look at my teeth: front teeth to snip leaves, flat back teeth to grind them."], ["hab", "forest", "I live in eastern Australia."], ["part", "nose", "I have a big nose."]],
      },
      facts: {
        pk: ["Koalas live in trees.", "Koalas sleep most of the day."],
        k:  ["Koalas eat eucalyptus leaves.", "They sleep up to 20 hours a day!", "Koalas are not bears."],
        g1: ["Koalas live in eucalyptus forests in eastern Australia.", "They hardly ever drink, because leaves give them water.", "A baby koala is called a joey and rides in its mother's pouch.", "Koalas have fingerprints, just like people!"],
        g2: ["Koalas eat only eucalyptus leaves, so they are herbivores.", "They snip leaves with their front teeth and grind them with flat back teeth.", "Koalas are marsupials, cousins of kangaroos and wombats, not bears.", "Eucalyptus is poisonous to most animals, but a koala's gut can handle it."],
      },
      partWhy: { nose: "a big nose for sniffing leaves", ears: "big fluffy ears", claws: "sharp claws for climbing", paws: "two thumbs on each front paw", fur: "thick fur like a raincoat" },
    },
    okapi: {
      name: "okapi", where: "central Africa", hab: "rainforest", diet: "plants", group: "hoofed", level: 2,
      clues: {
        pk: [["part", "stripes", "I have stripes on my legs."], ["part", "ears", "I have big ears."], ["part", "fur", "My fur is dark brown."], ["shadow", "", "Here is my shadow!"]],
        k:  [["part", "stripes", "My striped legs help me hide in the forest."], ["part", "ears", "My big ears hear leopards sneaking."], ["part", "hooves", "I have hooves."], ["part", "tail", "I have a tufted tail."]],
        g1: [["hab", "rainforest", "I live in a thick rainforest."], ["part", "stripes", "My stripes look like sunlight and shadows."], ["part", "ears", "My big ears hear danger far away."], ["part", "neck", "My neck is longer than a horse's."]],
        g2: [["food", "plants", "I eat leaves, buds, and fruit."], ["teeth", "", "Look at my teeth: wide, flat back teeth for grinding leaves."], ["hab", "rainforest", "I live in a rainforest in central Africa."], ["part", "horns", "I have bumps on my head, like a giraffe."]],
      },
      facts: {
        pk: ["Okapis have stripes on their legs.", "Okapis live in the forest."],
        k:  ["Okapis look like zebras, but they are not.", "Their stripes help them hide.", "They pull leaves off branches with a long tongue."],
        g1: ["Okapis live in one rainforest in central Africa.", "Their stripes look like light and shadows in the forest.", "Their tongue is so long they can lick their own ears!", "Scientists outside Africa did not learn about okapis until about 120 years ago."],
        g2: ["Okapis eat leaves, buds, and fruit, so they are herbivores.", "Surprise: the okapi's closest living cousin is the giraffe!", "Males have small ossicones, like a giraffe.", "Okapis have two toes on each foot, like giraffes and camels."],
      },
      partWhy: { stripes: "striped legs for hiding", ears: "big ears", hooves: "hooves", tail: "a tufted tail", neck: "a long neck", horns: "ossicones, like a giraffe" },
    },
    pangolin: {
      name: "pangolin", where: "Africa and Asia", hab: "grassland", diet: "meat", group: "carnivoran-cousin", level: 2,
      clues: {
        pk: [["part", "scales", "I am covered in scales."], ["part", "tail", "I have a long tail."], ["part", "nose", "I have a small pointy face."], ["shadow", "", "Here is my shadow!"]],
        k:  [["part", "scales", "My scales are hard, like fingernails."], ["part", "claws", "My big claws tear open ant hills."], ["part", "tail", "I can hang by my tail."], ["part", "nose", "My nose sniffs out ants."]],
        g1: [["hab", "grassland", "I live in grasslands and forests."], ["part", "scales", "I roll into a scaly ball when I'm scared."], ["part", "claws", "My claws dig into termite mounds."], ["part", "tail", "My scaly tail curls around me."]],
        g2: [["food", "meat", "I eat ants and termites."], ["teeth", "", "Look at my mouth: I have no teeth! I lick up ants with a long sticky tongue."], ["hab", "grassland", "I live in Africa and Asia."], ["part", "scales", "I am covered in scales."]],
      },
      facts: {
        pk: ["Pangolins are covered in scales.", "Pangolins roll into a ball."],
        k:  ["A pangolin's scales are made of keratin, like your fingernails.", "It eats ants and termites.", "It rolls into a tight ball to stay safe."],
        g1: ["Pangolins live in grasslands and forests in Africa and Asia.", "They are the only mammals covered in scales.", "Their tongue can be longer than their body!", "Babies ride on their mother's tail."],
        g2: ["Pangolins eat ants and termites, so they are carnivores. They are insect eaters.", "They have no teeth. Small stones in their stomach help mash their food.", "Surprise: the pangolin's closest cousins are the carnivorans, like lions and otters!", "Pangolins are in danger from hunting, so many countries protect them."],
      },
      partWhy: { scales: "hard scales like armor", claws: "big claws for digging", tail: "a strong scaly tail", nose: "a nose for sniffing ants" },
    },
    walrus: {
      name: "walrus", where: "the Arctic", hab: "ice", diet: "meat", group: "carnivoran", level: 2,
      clues: {
        pk: [["part", "tusks", "I have two long tusks."], ["part", "whiskers", "I have a bushy mustache of whiskers."], ["part", "flippers", "I have flippers."], ["shadow", "", "Here is my shadow!"]],
        k:  [["part", "tusks", "My long tusks help me climb out of the water."], ["part", "whiskers", "My whiskers feel for clams on the sea floor."], ["part", "flippers", "My flippers make me a strong swimmer."], ["part", "eyes", "I have small eyes."]],
        g1: [["hab", "ice", "I live in the cold Arctic sea and on the ice."], ["part", "tusks", "I use my tusks like ice picks to pull myself up."], ["part", "whiskers", "My whiskers find food in the dark mud."], ["part", "fur", "A thick layer of blubber keeps me warm."]],
        g2: [["food", "meat", "I eat clams, snails, and worms from the sea floor."], ["teeth", "", "Look at my teeth: my tusks are giant canine teeth!"], ["hab", "ice", "I live in the Arctic."], ["part", "flippers", "I have flippers."]],
      },
      facts: {
        pk: ["Walruses have long tusks.", "Walruses like to rest on the ice."],
        k:  ["A walrus has hundreds of whiskers.", "It uses its tusks to climb onto the ice.", "Walruses live together in big groups."],
        g1: ["Walruses live in the cold Arctic sea.", "Blubber under their skin keeps them warm in icy water.", "A walrus can suck a clam right out of its shell!", "They can sleep floating in the water."],
        g2: ["Walruses eat clams and other sea floor animals, so they are carnivores.", "Their tusks are long canine teeth that keep growing.", "Walruses are carnivorans on the dog branch, cousins of seals, sea lions, and bears.", "A big walrus can weigh as much as a small car."],
      },
      partWhy: { tusks: "long tusks for climbing", whiskers: "whiskers to feel for clams", flippers: "flippers for swimming", eyes: "small eyes", fur: "blubber to stay warm" },
    },
    wolf: {
      name: "gray wolf", where: "North America, Europe, and Asia", hab: "forest", diet: "meat", group: "carnivoran", level: 2,
      clues: {
        pk: [["part", "ears", "I have pointy ears."], ["part", "tail", "I have a bushy tail."], ["part", "fur", "My fur is gray."], ["shadow", "", "Here is my shadow!"]],
        k:  [["part", "nose", "My nose can smell animals far, far away."], ["part", "ears", "My ears hear my family howling."], ["part", "mouth", "I howl to talk to my pack."], ["part", "paws", "My big paws help me run in the snow."]],
        g1: [["hab", "forest", "I live in forests and on snowy plains."], ["part", "mouth", "I howl so my family knows where I am."], ["part", "nose", "My nose is a super sniffer."], ["part", "paws", "My big paws work like snowshoes."]],
        g2: [["food", "meat", "I hunt deer and elk with my family."], ["teeth", "", "Look at my teeth: long fangs and sharp, slicing back teeth."], ["hab", "forest", "I live in North America, Europe, and Asia."], ["part", "ears", "I have pointy ears."]],
      },
      facts: {
        pk: ["Wolves live in families called packs.", "Wolves howl!"],
        k:  ["A wolf's howl can be heard miles away.", "Wolves live and hunt together in packs.", "Pet dogs came from wolves long, long ago."],
        g1: ["Gray wolves live in forests, mountains, and snowy plains.", "A pack is a family: parents and their pups.", "Wolves can smell other animals more than a mile away.", "All pet dogs, from tiny to huge, came from wolves."],
        g2: ["Wolves hunt deer, elk, and moose, so they are carnivores.", "Their slicing back teeth, called carnassials, cut meat like scissors.", "Wolves are on the dog branch of carnivorans, with foxes and pet dogs.", "Wolves helped Yellowstone's rivers and forests by keeping elk on the move."],
      },
      partWhy: { nose: "a super sniffer nose", ears: "pointy ears", mouth: "a mouth for howling", paws: "big paws like snowshoes", tail: "a bushy tail", fur: "thick gray fur" },
    },
    snowleopard: {
      name: "snow leopard", where: "the mountains of central Asia", hab: "mountain", diet: "meat", group: "carnivoran", level: 2,
      clues: {
        pk: [["part", "tail", "I have a long, thick tail."], ["part", "fur", "My fur is pale with dark spots."], ["part", "paws", "I have big paws."], ["shadow", "", "Here is my shadow!"]],
        k:  [["part", "tail", "My thick tail helps me balance on cliffs."], ["part", "paws", "My big furry paws are like snowshoes."], ["part", "fur", "My spotted fur hides me on rocks."], ["part", "eyes", "My eyes are pale green or gray."]],
        g1: [["hab", "mountain", "I live high in snowy mountains."], ["part", "tail", "I wrap my tail over my nose to stay warm."], ["part", "paws", "My wide paws don't sink in snow."], ["part", "fur", "My spots blend in with snowy rocks."]],
        g2: [["food", "meat", "I hunt wild sheep and goats."], ["teeth", "", "Look at my teeth: big fangs and sharp slicing back teeth."], ["hab", "mountain", "I live in the mountains of central Asia."], ["part", "tail", "I have a long thick tail."]],
      },
      facts: {
        pk: ["Snow leopards live in the snowy mountains.", "They have a big fluffy tail."],
        k:  ["A snow leopard can jump very far.", "It uses its tail like a scarf.", "Its spots help it hide on rocks."],
        g1: ["Snow leopards live high in the mountains of central Asia.", "Their tail is almost as long as their body.", "They can leap six times their body length!", "Snow leopards can't roar. They chuff, hiss, and mew."],
        g2: ["Snow leopards hunt wild sheep and goats, so they are carnivores.", "Their sharp carnassial teeth slice meat.", "They are on the cat branch, cousins of lions and tigers.", "Big chests and noses help them breathe the thin mountain air."],
      },
      partWhy: { tail: "a long tail for balance", paws: "big paws like snowshoes", fur: "spotted fur for hiding", eyes: "pale eyes", ears: "small round ears" },
    },
  };

  /* Words for each part, said aloud ("Tap the ___"). */
  const PARTS = {
    ears: "ears", eyes: "eyes", nose: "nose", mouth: "mouth", whiskers: "whiskers", fur: "fur", paws: "paws", claws: "claws",
    tail: "tail", mane: "mane", trunk: "trunk", tusks: "tusks", neck: "neck", horns: "ossicones", hump: "hump", pouch: "pouch", hooves: "hooves",
    bill: "bill", wings: "wings", shell: "shell", spines: "spines", scales: "scales", stripes: "striped legs", flippers: "flippers", branch: "branch",
  };
  const PART_SAY = { paws: { kangaroo: "feet", elephant: "feet", camel: "feet", otter: "webbed feet", platypus: "webbed feet", sloth: "feet", armadillo: "legs", pangolin: "legs" }, horns: { giraffe: "ossicones, the bumps on its head", okapi: "ossicones, the bumps on its head" } };

  const DIET = {
    meat: { word: "carnivore", kid: "meat", say: "Meat. Other animals." },
    plants: { word: "herbivore", kid: "plants", say: "Plants." },
    both: { word: "omnivore", kid: "both", say: "Both! Plants and animals." },
  };

  /* 2nd grade: Family secrets. Which two are closer cousins? The answer pair comes first. */
  const COUSINS = [
    { pair: ["lion", "meerkat"], odd: "fox", why: "Lions and meerkats are both on the cat branch of the carnivoran family tree. Foxes are on the dog branch." },
    { pair: ["fox", "otter"], odd: "lion", why: "Foxes and otters are both on the dog branch of the carnivoran family tree. Lions are on the cat branch." },
    { pair: ["otter", "raccoon"], odd: "polarbear", why: "Otters and raccoons sit on the same small branch, with weasels and skunks. Bears branched off a little earlier." },
    { pair: ["polarbear", "panda"], odd: "raccoon", why: "Polar bears and giant pandas are both bears!" },
    { pair: ["giraffe", "camel"], odd: "lion", why: "Giraffes and camels both have two toes on each foot, and both chew their food twice." },
    { pair: ["lion", "giraffe"], odd: "kangaroo", why: "Kangaroo babies are born tiny and grow in a pouch. Lion and giraffe babies grow inside their mother until they are bigger. So lions and giraffes are closer cousins." },
    { pair: ["rabbit", "elephant"], odd: "kangaroo", why: "Rabbit and elephant babies grow inside their mother. Kangaroo babies grow in a pouch. So rabbits and elephants are closer cousins." },
    { pair: ["panda", "lion"], odd: "giraffe", why: "Pandas and lions are both carnivorans. They share special cheek teeth, even though pandas eat bamboo!" },
    { pair: ["fox", "raccoon"], odd: "camel", why: "Foxes and raccoons are both carnivorans, on the dog branch." },
    { pair: ["lion", "giraffe"], odd: "rabbit", why: "Surprise! Scientists compared their DNA. Lions and giraffes share a more recent great-great-grandparent with each other than either one shares with a rabbit." },
  ];

  /* The whole family tree, as nested groups. Each group has a name and what it means. */
  // Family tree. Tapping a dot tells kids about the whole group, including relatives that are not in the game.
  // more: extra sentences read aloud and shown on the card. also: other members, not in the game.
  const TREE = {
    k: "mammals", label: "Mammals", name: "Mammals", say: "Mammals. They all have fur or hair, and their mothers make milk for their babies.",
    more: ["There are more than 6,000 kinds of mammals.", "Bats, whales, mice, and people are mammals too.", "The platypus and the echidna are mammals that lay eggs!"],
    also: ["bats", "whales", "mice", "people", "platypus", "echidnas"],
    c: [{
      k: "marsup", label: "Marsupials", name: "Marsupials", say: "Marsupials. Their babies are born very tiny and keep growing in their mother's pouch.", teeth: "kangaroo", teethSay: "Teeth clue: kangaroos have long front teeth to snip grass and flat back teeth to grind it.",
      more: ["A newborn kangaroo, called a joey, is about the size of a jellybean.", "Most marsupials live in Australia and nearby islands.", "The opossum is a marsupial that lives in North and South America."],
      also: ["koalas", "wombats", "Tasmanian devils", "opossums", "sugar gliders"],
      c: ["kangaroo"] }, {
      k: "placental", label: "Placentals", name: "Placental mammals", say: "Placental mammals. Their babies grow inside their mother until they are bigger.", teeth: "elephant", teethSay: "Teeth clue: an elephant's tusks are giant front teeth that never stop growing!",
      more: ["Most mammals are placentals, from tiny shrews to giant blue whales.", "Elephants are on their own early branch. Their closest cousins are manatees and little furry hyraxes!"],
      also: ["manatees", "hyraxes", "aardvarks", "sloths", "armadillos", "shrews", "blue whales"],
      c: ["elephant", {
        k: "boreo", label: "Northern", name: "Northern placentals", say: "Northern placentals. Long, long ago, their great-great-grandparents lived in the northern part of the world.",
        more: ["Scientists call this group Boreoeutheria.", "Rabbits are on the branch with rodents like mice and squirrels. Monkeys and people are on that branch too!"],
        also: ["mice", "squirrels", "beavers", "hares", "monkeys", "people"],
        c: ["rabbit", {
          k: "laura", label: "Laurasians", name: "Laurasians", say: "Carnivorans and hoofed animals are cousins!",
          more: ["Scientists call this big group Laurasiatheria.", "Bats, hedgehogs, horses, and scaly pangolins belong to it too."],
          also: ["bats", "hedgehogs", "moles", "horses", "rhinos", "pangolins"],
          c: [{ k: "hoofed", label: "Hoofed", name: "Two-toed hoofed animals", say: "Two-toed hoofed animals, like giraffes and camels.", teeth: "giraffe", teethSay: "Teeth clue: most have wide, flat back teeth with ridges for grinding plants. Many chew their food twice!",
                more: ["They walk on two toes on each foot, tipped with hooves.", "Cows, pigs, deer, and hippos are in this group.", "Surprise! Whales and dolphins belong here too. Their great-great-grandparents walked on land."],
                also: ["cows", "pigs", "deer", "hippos", "whales", "dolphins"], c: ["giraffe", "camel"] },
              { k: "carn", label: "Carnivorans", name: "Carnivorans", say: "Carnivorans. They share special cheek teeth for slicing food.", teeth: "lion", teethSay: "Teeth clue: carnivorans have a special pair of back teeth called carnassials. They work like scissors to slice food.",
                more: ["There are about 300 kinds of carnivorans, on land and in the sea.", "Most eat meat, but not all. Giant pandas eat bamboo!", "Scientists at the SQuEACs Lab study the skulls and brains of river otters, which are carnivorans."],
                also: ["dogs", "wolves", "tigers", "hyenas", "seals", "walruses"], c: [
                { k: "catb", label: "Cat branch", name: "Cat branch", say: "The cat branch, with lions and meerkats.", teeth: "lion", teethSay: "Teeth clue: cats have very sharp, blade-like back teeth and almost no flat ones. They are meat specialists.",
                  more: ["Scientists call it Feliformia, which means cat-shaped.", "Meerkats are a kind of mongoose. Hyenas look like dogs, but they are on the cat branch!"],
                  also: ["tigers", "cheetahs", "house cats", "hyenas", "mongooses", "civets"], c: ["lion", "meerkat"] },
                { k: "dogb", label: "Dog branch", name: "Dog branch", say: "The dog branch, with foxes, bears, otters, and raccoons.", teeth: "fox", teethSay: "Teeth clue: many on the dog branch have slicing teeth plus bumpy back teeth, so they can eat lots of different foods.",
                  more: ["Scientists call it Caniformia, which means dog-shaped.", "Seals, sea lions, and walruses are on the dog branch. They are sea-going carnivorans!"],
                  also: ["wolves", "pet dogs", "coyotes", "seals", "sea lions", "walruses"], c: ["fox", {
                  k: "arct", label: "Bear-weasel", name: "Bears, weasels, and seals", say: "Bears, otters, and raccoons.",
                  more: ["Scientists call this group Arctoidea, which means bear-like.", "Seals and walruses belong in this group too. Their closest land cousins are bears and weasels."],
                  also: ["seals", "sea lions", "walruses", "skunks", "red pandas"], c: [
                    { k: "bears", label: "Bears", name: "Bears", say: "Bears.", teeth: "panda", teethSay: "Teeth clue: bears have big fangs, but their back teeth are wide and flat-topped for crushing. Pandas have the flattest of all, for bamboo.",
                      more: ["There are eight kinds of bears in the world.", "The giant panda is a real bear. It just eats bamboo!", "Polar bears are the biggest carnivorans that live on land."],
                      also: ["grizzly bears", "black bears", "sun bears", "sloth bears", "spectacled bears", "moon bears"], c: ["polarbear", "panda"] },
                    { k: "must", label: "Weasel branch", name: "Weasel and raccoon branch", say: "The weasel and raccoon branch.", teeth: "raccoon", teethSay: "Teeth clue: otters have pointy teeth for grabbing fish. Raccoons have bumpier back teeth for eating almost anything.",
                      more: ["Scientists call it Musteloidea.", "Otters are part of the weasel family, along with badgers and wolverines.", "Raccoons have cousins called coatis and kinkajous. Skunks and red pandas are on this branch too."],
                      also: ["weasels", "badgers", "wolverines", "skunks", "red pandas", "coatis", "kinkajous"], c: ["otter", "raccoon"] }] }] }] }] }] }] }],
  };

  const GRADES = {
    pk: { name: "Pre-K", say: "Pre-K", suspects: 3, cases: 3 },
    k:  { name: "K", say: "Kindergarten", suspects: 4, cases: 3 },
    g1: { name: "1st", say: "First grade", suspects: 4, cases: 3 },
    g2: { name: "2nd", say: "Second grade", suspects: 4, cases: 3 },
  };


  /* Animal superpowers: one body part per animal that does something amazing.
     Children tap the glowing part and watch it work, then hear how it helps.
     act = how the animal moves, fx = the little effect that plays. */
  const POWERS = {
    otter: { part: "paws", name: "Super Swimmer", act: "swim", fx: "bubbles", say: {
      pk: "Otters are super swimmers! Their webbed feet push the water like flippers.",
      k: "Webbed feet work like flippers. Otters zoom through the water to catch fish.",
      g1: "Webbed feet push lots of water with every kick, so otters swim fast and turn quickly to catch fish.",
      g2: "Webbed feet are an adaptation: a body part that helps an animal survive where it lives. Wide, webbed feet push more water, so otters are fast swimmers." } },
    raccoon: { part: "paws", name: "Clever Hands", act: "wiggle", fx: "sparkle", say: {
      pk: "Raccoons have clever hands! They can grab and open things.",
      k: "A raccoon's front paws work like hands. They can feel food in the water without looking.",
      g1: "Raccoon paws can feel tiny things. Raccoons pat around in streams to find crayfish and snails.",
      g2: "Raccoon paws are packed with nerves, and wet paws feel even better. That's why raccoons seem to wash their food: they are really feeling it." } },
    fox: { part: "ears", name: "Super Hearing", act: "pounce", fx: "waves", say: {
      pk: "Foxes have super ears! They can hear a tiny mouse hiding.",
      k: "A fox can hear a mouse squeak under the snow. Then it jumps up and pounces!",
      g1: "Big, pointy ears turn toward sounds. A red fox can hear a mouse under the snow, then leap high and dive in nose first.",
      g2: "Red foxes hear quiet, low sounds very well. Scientists noticed that foxes often pounce facing the same direction, and think they might use Earth's magnetism to aim!" } },
    lion: { part: "mouth", name: "Mighty Roar", act: "roar", fx: "waves", say: {
      pk: "Lions have a big, loud roar! Roar!",
      k: "A lion's roar is so loud you can hear it far, far away. It tells other lions: this is my home.",
      g1: "A lion's roar can be heard about 5 miles away. Lions roar to tell other lions where they are and to keep strangers away.",
      g2: "Lions have a special voice box that lets them roar very loudly. The roar travels about 5 miles and helps a pride guard its land." } },
    polarbear: { part: "nose", name: "Super Sniffer", act: "sniff", fx: "scent", say: {
      pk: "Polar bears have super noses! They can smell food far away.",
      k: "A polar bear can smell a seal far away, even under the snow.",
      g1: "A polar bear's nose is one of the best in the world. It can smell a seal's breathing hole under the snow from far away.",
      g2: "Polar bears have a huge space inside the nose for smelling. On the sea ice, that super sniffer leads them to seals, their main food." } },
    panda: { part: "paws", name: "Bamboo Grabber", act: "wiggle", fx: "leaves", say: {
      pk: "Pandas have a special thumb for holding bamboo!",
      k: "A panda has an extra bump on its wrist, like a thumb. It helps hold bamboo.",
      g1: "Pandas have a wrist bone that sticks out like a thumb. It helps them grip bamboo while they munch for many hours every day.",
      g2: "The panda's thumb is really a wrist bone that grew bigger. Over a very long time, evolution reused a bone in a new way to help pandas eat bamboo." } },
    meerkat: { part: "claws", name: "Digging Claws", act: "dig", fx: "dust", say: {
      pk: "Meerkats have strong claws for digging!",
      k: "Meerkats dig with long, strong claws. They dig burrows and find bugs to eat.",
      g1: "Long front claws make meerkats super diggers. They dig burrows to hide in, and dig up beetles and scorpions to eat.",
      g2: "Meerkats can move a lot of sand very fast. They can even close their ears while digging, so sand stays out." } },
    rabbit: { part: "ears", name: "Radar Ears", act: "hop", fx: "waves", say: {
      pk: "Rabbits have long ears to hear danger!",
      k: "A rabbit can turn its long ears to listen in different directions.",
      g1: "Rabbits can move each ear on its own to find sounds. If they hear danger, they hop away fast!",
      g2: "Long ears catch faint sounds, and they also help a rabbit cool off, because warm blood flows through them and lets heat out." } },
    kangaroo: { part: "paws", name: "Super Hop", act: "hop", fx: "dust", say: {
      pk: "Kangaroos have big feet for hopping! Hop, hop, hop!",
      k: "Kangaroos hop on their big back feet. Their tail helps them balance.",
      g1: "Big back legs and long feet make kangaroos super hoppers. A red kangaroo can jump about 25 feet in one hop!",
      g2: "Kangaroo leg tendons stretch like springs and bounce back, so hopping saves energy. That's how kangaroos travel far without getting tired." } },
    elephant: { part: "trunk", name: "Super Trunk", act: "sway", fx: "drops", say: {
      pk: "Elephants have a super trunk! They can spray water.",
      k: "An elephant's trunk is a nose and a hand. It can grab food and spray water.",
      g1: "An elephant's trunk has thousands of muscles. It can pick up a peanut, pull down a branch, or suck up about 2 gallons of water.",
      g2: "The trunk is the elephant's nose and upper lip joined together. With about 40 thousand muscles, it can smell, grab, drink, and even say hello." } },
    giraffe: { part: "neck", name: "Super Reach", act: "stretch", fx: "leaves", say: {
      pk: "Giraffes have long necks to reach leaves up high!",
      k: "A giraffe's long neck reaches the leaves at the top of the trees.",
      g1: "A giraffe's neck is about 6 feet long, so it can eat leaves that other animals can't reach.",
      g2: "A giraffe's neck has 7 bones, the same number as yours! Each bone is just very, very long." } },
    camel: { part: "hump", name: "Hump Power", act: "sway", fx: "sparkle", say: {
      pk: "Camels have a hump full of fat. It helps them in the desert.",
      k: "A camel's hump stores fat, not water. It's like a snack pack for long trips.",
      g1: "A camel can go many days without food, because its body uses the fat in its hump. When the fat is used up, the hump gets floppy!",
      g2: "Keeping fat in one hump, instead of all over its body, helps a camel stay cooler in the hot desert. Camels can also drink lots of water very fast." } },
    redpanda: { part: "tail", name: "Tail Blanket", act: "sway", fx: "sparkle", say: {
      pk: "Red pandas use their fluffy tail like a blanket! Cozy!",
      k: "When it gets cold, a red panda curls up and wraps its fluffy tail around its body.",
      g1: "High in the cold mountains, a red panda wraps its thick, fluffy tail around itself, even over its face, like a warm blanket.",
      g2: "A thick tail, furry feet, and dense fur all trap warm air. These adaptations let red pandas live in cold, snowy mountain forests." } },
    sloth: { part: "claws", name: "Hang Tight", act: "sway", fx: "leaves", say: {
      pk: "Sloths have hook claws! They hang on tight, even when they sleep.",
      k: "A sloth's long claws work like hooks. It can hang upside down all day without getting tired.",
      g1: "Sloth claws hook over branches and stay locked, so sloths can hang and even sleep upside down without falling.",
      g2: "Sloth muscles and tendons lock their claws in place, so hanging takes almost no energy. That helps them live on a diet of low-energy leaves." } },
    armadillo: { part: "shell", name: "Armor Shell", act: "wiggle", fx: "sparkle", say: {
      pk: "Armadillos wear armor! Their hard shell keeps them safe.",
      k: "An armadillo's shell is made of hard bony plates. Bendy bands in the middle let it move and curl up.",
      g1: "Armadillo armor is bone covered with tough skin. When danger comes, it can dash into thorny bushes where its shell protects it.",
      g2: "Armadillos are the only living mammals with a bony shell. Some kinds can roll into a ball, and others jump straight up to startle a predator!" } },
    platypus: { part: "bill", name: "Electric Bill", act: "swim", fx: "waves", say: {
      pk: "The platypus has a magic bill! It feels for food underwater.",
      k: "The platypus closes its eyes underwater and finds food with its bill.",
      g1: "A platypus bill can feel tiny electric zaps made by shrimp and bugs moving underwater. It finds food with its eyes, ears, and nose shut!",
      g2: "The bill has about 40 thousand electricity sensors. Sensing electricity is called electroreception, and almost no other mammals can do it." } },
    hedgehog: { part: "spines", name: "Spiky Ball", act: "wiggle", fx: "sparkle", say: {
      pk: "Hedgehogs roll into a spiky ball! Ouch, stay away!",
      k: "When a hedgehog is scared, it tucks in its head and feet and rolls into a ball of spines.",
      g1: "A hedgehog has about 5,000 spines. Special muscles pull its skin tight like a bag, so it becomes a spiky ball no predator wants to bite.",
      g2: "Hedgehog spines are hairs that became hard and hollow. They are light but strong, and they even cushion the hedgehog if it falls." } },
    bat: { part: "wings", name: "Night Flyer", act: "stretch", fx: "leaves", say: {
      pk: "Bats can fly! Their wings flap, flap, flap!",
      k: "A bat's wing is its hand! Thin skin stretches between very long fingers.",
      g1: "Bats are the only mammals that can really fly. Fruit bats fly at night to find ripe fruit and flowers, and they spread seeds as they go.",
      g2: "A bat wing has the same bones as your hand, just much longer. Bending its fingers changes the wing's shape, so bats can turn sharply in the air." } },
    koala: { part: "nose", name: "Leaf Sniffer", act: "sniff", fx: "scent", say: {
      pk: "Koalas have a big nose to sniff out the best leaves!",
      k: "Koalas sniff every leaf before eating, to pick the yummiest and safest ones.",
      g1: "Eucalyptus leaves can be poisonous. A koala's big nose smells which leaves are safe and tasty before it takes a bite.",
      g2: "A koala's keen nose picks leaves with fewer poisons and more water, and a very long gut helps break the rest down. That's how koalas live on leaves other animals can't eat." } },
    okapi: { part: "stripes", name: "Forest Stripes", act: "sway", fx: "leaves", say: {
      pk: "Okapis have stripes to hide in the forest! Can you see me?",
      k: "An okapi's striped legs look like sunlight and shadows in the forest, so it is hard to see.",
      g1: "In the dark rainforest, the stripes break up the okapi's shape. Baby okapis may also follow their mother's striped legs.",
      g2: "Stripes that break up an animal's outline are called disruptive camouflage. The okapi's look helps it hide from leopards in the rainforest." } },
    pangolin: { part: "scales", name: "Scaly Armor", act: "wiggle", fx: "sparkle", say: {
      pk: "Pangolins roll up in their scales like a ball! Safe!",
      k: "A pangolin's scales are hard, like your fingernails. It rolls into a tight ball to stay safe.",
      g1: "When a lion comes close, a pangolin rolls into a ball of sharp-edged scales. Even a lion can't open it!",
      g2: "Pangolins are the only mammals covered in scales. The scales are made of keratin, the same stuff as your hair and fingernails." } },
    walrus: { part: "tusks", name: "Ice Picks", act: "stretch", fx: "drops", say: {
      pk: "Walruses use their tusks to climb onto the ice!",
      k: "A walrus digs its long tusks into the ice and pulls itself out of the water.",
      g1: "Walrus tusks work like ice picks. They help the walrus climb onto the ice, and they show other walruses who's boss.",
      g2: "Walrus tusks are long canine teeth that grow all their life. The scientific name for walrus means tooth-walking sea horse!" } },
    wolf: { part: "mouth", name: "Pack Howl", act: "roar", fx: "waves", say: {
      pk: "Wolves howl to their family! Ow-ooo!",
      k: "Wolves howl to call their pack together and to say: this is our home.",
      g1: "A wolf's howl can be heard miles away. Howling helps a pack find each other and tells other wolves to stay away.",
      g2: "Each wolf's howl sounds a little different, so pack members can tell who is calling. Working as a team lets wolves hunt animals much bigger than they are." } },
    snowleopard: { part: "tail", name: "Balance Tail", act: "sway", fx: "sparkle", say: {
      pk: "Snow leopards have a long tail to help them balance on rocks!",
      k: "A snow leopard's long tail helps it balance when it jumps across rocky cliffs. At night, it wraps its tail around itself like a scarf.",
      g1: "Snow leopards leap across steep cliffs. Their long, thick tail helps them steer and balance, and keeps them warm when they sleep.",
      g2: "A snow leopard's tail is almost as long as its body. It works like a tightrope walker's pole for balance, and its thick fur stores warmth." } },
  };

  /* What each animal's footprints look like, said in the footprint game. */
  const TRACK_SAY = {
    otter: "Otter tracks have five toes with webbing between them, for swimming.",
    raccoon: "Raccoon tracks look like tiny hands with five long fingers.",
    fox: "Fox tracks are small ovals with four toes and little claw marks.",
    lion: "Lion tracks have four round toes and a big pad, but no claw marks. Cats tuck their claws in.",
    polarbear: "Polar bear tracks are huge, with five toes and claws for gripping the ice.",
    panda: "Panda tracks are bear tracks: five toes and a wide pad.",
    meerkat: "Meerkat tracks are tiny, with long claw marks from digging claws.",
    rabbit: "Rabbit tracks: two long back feet land in front of two small front feet.",
    kangaroo: "Kangaroo tracks are two long, skinny feet side by side, from hopping.",
    elephant: "Elephant tracks are giant circles, as big as a dinner plate!",
    giraffe: "Giraffe tracks are hooves split in two, shaped like a big heart.",
    camel: "Camel tracks are wide and soft, with two toes, for walking on sand.",
    redpanda: "Red panda tracks have five toes and furry soles, like little snow boots.",
    sloth: "Sloth tracks are rare, because sloths almost never walk on the ground! You see long claw drags.",
    armadillo: "Armadillo tracks look like bird tracks: pointy toes with long claws.",
    platypus: "Platypus tracks have five toes, webbing, and claws, at the edge of a river.",
    hedgehog: "Hedgehog tracks look like tiny hands with five thin toes.",
    bat: "Fruit bat tracks are tiny, from feet and thumb claws, when a bat crawls.",
    koala: "Koala tracks show five toes, with two thumbs on the front feet for gripping trees.",
    okapi: "Okapi tracks are split hooves, like a giraffe's, but smaller.",
    pangolin: "Pangolin tracks are small round prints, with long claw marks in front.",
    walrus: "Walrus tracks are wide flipper marks on the sand or snow.",
    wolf: "Wolf tracks look like big dog tracks: four toes and claw marks.",
    snowleopard: "Snow leopard tracks are big and round, with four toes and no claw marks.",
  };

  /* Real animal sounds. Put openly licensed recordings in assets/mammal-mystery/sounds/
     (mp3 or m4a) and fill in src and credit, the same way as PHOTOS. Until then, no call plays. */
  const SOUNDS = {
    otter: { src: "", credit: "" }, raccoon: { src: "", credit: "" }, fox: { src: "", credit: "" }, lion: { src: "", credit: "" },
    polarbear: { src: "", credit: "" }, panda: { src: "", credit: "" }, meerkat: { src: "", credit: "" }, rabbit: { src: "", credit: "" },
    kangaroo: { src: "", credit: "" }, elephant: { src: "", credit: "" }, giraffe: { src: "", credit: "" }, camel: { src: "", credit: "" },
    redpanda: { src: "", credit: "" }, sloth: { src: "", credit: "" }, armadillo: { src: "", credit: "" }, platypus: { src: "", credit: "" },
    hedgehog: { src: "", credit: "" }, bat: { src: "", credit: "" }, koala: { src: "", credit: "" }, okapi: { src: "", credit: "" },
    pangolin: { src: "", credit: "" }, walrus: { src: "", credit: "" }, wolf: { src: "", credit: "" }, snowleopard: { src: "", credit: "" },
  };

  /* Detective ranks: [mysteries solved, rank name, badge color] */
  const RANKS = [[0, "Rookie Detective", "#c9c5cf"], [3, "Junior Detective", "#7ccf68"], [6, "Detective", "#4aa3df"], [12, "Senior Detective", "#a47bff"], [20, "Super Sleuth", "#ff9f40"], [30, "Master Detective", "#ffd23f"]];

  window.MM_DATA = { PHOTOS, SOUNDS, ANIMALS, PARTS, PART_SAY, DIET, COUSINS, TREE, GRADES, POWERS, TRACK_SAY, RANKS,
    IDS: Object.keys(ANIMALS).filter(id => ANIMALS[id].level !== 2),    // Level 1: the first twelve
    IDS2: Object.keys(ANIMALS).filter(id => ANIMALS[id].level === 2),   // Level 2: surprising mammals
    ALL: Object.keys(ANIMALS) };
})();
