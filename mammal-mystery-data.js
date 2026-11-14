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
      name: "rabbit", where: "many parts of the world", hab: "grassland", diet: "plants", group: "other",
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
      name: "kangaroo", where: "Australia", hab: "grassland", diet: "plants", group: "marsupial",
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
  };

  /* Words for each part, said aloud ("Tap the ___"). */
  const PARTS = {
    ears: "ears", eyes: "eyes", nose: "nose", mouth: "mouth", whiskers: "whiskers", fur: "fur", paws: "paws", claws: "claws",
    tail: "tail", mane: "mane", trunk: "trunk", tusks: "tusks", neck: "neck", horns: "ossicones", hump: "hump", pouch: "pouch", hooves: "hooves",
  };
  const PART_SAY = { paws: { kangaroo: "feet", elephant: "feet", camel: "feet", otter: "webbed feet" }, horns: { giraffe: "ossicones, the bumps on its head" } };

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
  const TREE = {
    k: "mammals", label: "Mammals", name: "Mammals", say: "Mammals. They all have fur or hair, and their mothers make milk for their babies.",
    c: ["kangaroo", {
      k: "placental", label: "Placentals", name: "Placental mammals", say: "Placental mammals. Their babies grow inside their mother until they are bigger.",
      c: ["elephant", {
        k: "boreo", name: "", say: "These animals share an even more recent great-great-grandparent.",
        c: ["rabbit", {
          k: "laura", name: "", say: "Carnivorans and hoofed animals are cousins!",
          c: [{ k: "hoofed", label: "Hoofed", name: "Two-toed hoofed animals", say: "Two-toed hoofed animals, like giraffes and camels.", c: ["giraffe", "camel"] },
              { k: "carn", label: "Carnivorans", name: "Carnivorans", say: "Carnivorans. They share special cheek teeth for slicing food.", c: [
                { k: "catb", label: "Cat branch", name: "Cat branch", say: "The cat branch, with lions and meerkats.", c: ["lion", "meerkat"] },
                { k: "dogb", label: "Dog branch", name: "Dog branch", say: "The dog branch, with foxes, bears, otters, and raccoons.", c: ["fox", {
                  k: "arct", name: "", say: "Bears, otters, and raccoons.", c: [
                    { k: "bears", label: "Bears", name: "Bears", say: "Bears.", c: ["polarbear", "panda"] },
                    { k: "must", label: "Weasel branch", name: "Weasel and raccoon branch", say: "The weasel and raccoon branch.", c: ["otter", "raccoon"] }] }] }] }] }] }] }],
  };

  const GRADES = {
    pk: { name: "Pre-K", say: "Pre-K", suspects: 3, cases: 4 },
    k:  { name: "K", say: "Kindergarten", suspects: 4, cases: 5 },
    g1: { name: "1st", say: "First grade", suspects: 4, cases: 5 },
    g2: { name: "2nd", say: "Second grade", suspects: 5, cases: 5 },
  };

  window.MM_DATA = { PHOTOS, ANIMALS, PARTS, PART_SAY, DIET, COUSINS, TREE, GRADES, IDS: Object.keys(ANIMALS) };
})();
