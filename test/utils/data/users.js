const usersJson = [
	{
		"first_name": "Delmy",
		"last_name": "Hamilton",
		"email": "staffing2025@outlook.com"
	},
	{
		"first_name": "Cristobal",
		"last_name": "Burt",
		"email": "dicke2089@yandex.com"
	},
	{
		"first_name": "Isaiah",
		"last_name": "Neal",
		"email": "helicopter1850@live.com"
	},
	{
		"first_name": "Tanner",
		"last_name": "Cote",
		"email": "leads1839@live.com"
	},
	{
		"first_name": "Guillermo",
		"last_name": "Bryan",
		"email": "rights1962@yandex.com"
	},
	{
		"first_name": "Sena",
		"last_name": "Reyes",
		"email": "sleep2025@example.com"
	},
	{
		"first_name": "Boyce",
		"last_name": "Grant",
		"email": "pioneer1886@yahoo.com"
	},
	{
		"first_name": "France",
		"last_name": "Macdonald",
		"email": "glasses1813@protonmail.com"
	},
	{
		"first_name": "Jamal",
		"last_name": "Vinson",
		"email": "cloth1867@outlook.com"
	},
	{
		"first_name": "Luise",
		"last_name": "Mcgee",
		"email": "locator1979@yandex.com"
	},
	{
		"first_name": "Travis",
		"last_name": "Maxwell",
		"email": "minerals1997@outlook.com"
	},
	{
		"first_name": "Virgilio",
		"last_name": "Jones",
		"email": "describe1895@example.com"
	},
	{
		"first_name": "Adolfo",
		"last_name": "Reyes",
		"email": "toolbar1899@yandex.com"
	},
	{
		"first_name": "Fausto",
		"last_name": "Berger",
		"email": "orlando1910@live.com"
	},
	{
		"first_name": "Allegra",
		"last_name": "Rollins",
		"email": "lounge2015@example.org"
	},
	{
		"first_name": "Oliver",
		"last_name": "Buckner",
		"email": "cir1912@outlook.com"
	},
	{
		"first_name": "Matt",
		"last_name": "Davidson",
		"email": "directed2062@example.org"
	},
	{
		"first_name": "Rubin",
		"last_name": "Hardy",
		"email": "huge1819@example.com"
	},
	{
		"first_name": "Solomon",
		"last_name": "Wilcox",
		"email": "forgotten2031@outlook.com"
	},
	{
		"first_name": "Desirae",
		"last_name": "Nash",
		"email": "missed2061@yandex.com"
	},
	{
		"first_name": "Armand",
		"last_name": "Kelley",
		"email": "blessed1996@example.org"
	},
	{
		"first_name": "Sherell",
		"last_name": "Mathews",
		"email": "spiritual2050@yandex.com"
	},
	{
		"first_name": "Samella",
		"last_name": "Chavez",
		"email": "examined2062@yandex.com"
	},
	{
		"first_name": "Donella",
		"last_name": "Mooney",
		"email": "meter2084@example.com"
	},
	{
		"first_name": "Rolando",
		"last_name": "Levy",
		"email": "clay1867@gmail.com"
	},
	{
		"first_name": "Mitchel",
		"last_name": "Finch",
		"email": "recognized2003@outlook.com"
	},
	{
		"first_name": "Les",
		"last_name": "Frye",
		"email": "per2058@duck.com"
	},
	{
		"first_name": "Babette",
		"last_name": "Diaz",
		"email": "calculate1906@yandex.com"
	},
	{
		"first_name": "Gertrud",
		"last_name": "Stein",
		"email": "planners1851@yahoo.com"
	},
	{
		"first_name": "Rachal",
		"last_name": "Harrell",
		"email": "forecasts1824@protonmail.com"
	}
];

module.exports = {
	usersJson,
	usersSqlValues: usersJson.map(user => {
		return `('${user.email}', '${user.first_name}', '${user.last_name}')`;
	})
}