export const getBuildImages = () => ({
    "11": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQxHgCiZMuC7T-fLwdrbbDvq6vAfo3w4SKY3wEAnyIEPUw7XPmBVnFgXY286G5AI2naLI&usqp=CAU",
    "10": "https://assetsio.gnwcdn.com/fortnite-season-10-battle-pass-skins-changes-6003-1564646875464.jpg?width=1200&height=630&fit=crop&enable=upscale&auto=png",
    "9": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQT4AqzH-IYvr2XbLSIMfOzQX1ulJ-BL0xfw&s",
    "8": "https://cdn2.unrealengine.com/Fortnite%2Fblog%2Fseason-8%2FBR08_News_Featured_Launch_ScreenKeyArt_Announce-1920x1080-f831323339109ab3c6a8d9e4c670f1973b8796d0.jpg",
    "7": "https://cdn2.unrealengine.com/Fortnite%2Fpatch-notes%2Fv7-00%2Fheader-v7-00%2FPATCH-BR07_News_Featured_16_9-1920x1080-cffcaf5bb2ed63854673855b592e167e7e817360.jpg",
    "6": "https://cdn2.unrealengine.com/Fortnite%2Fpatch-notes%2Fv6-00%2Fbr-header-v6-00%2FBR06_News_Featured_16_9_ReleaseNotes-1920x1080-9a66a68e6061577160f354858e3e13d80eda6886.jpg",
    "16": "https://static1.srcdn.com/wordpress/wp-content/uploads/2021/03/Fortnite-Season-6-Battle-Pass-Characters-1.jpg",
    "17": "https://cdn.mos.cms.futurecdn.net/FnGEJtCKmFSFot4d7DoR9Z.jpeg",
    "18": "https://cdn2.unrealengine.com/s18-ss-cinematic-1920x1080-01-1920x1080-26b0af26e89b.jpg",
    "19": "https://cdn2.unrealengine.com/fortnite-chapter-3-season-1-flipped-3840x2160-27429dc20c19.jpg",
    "20": "https://cdn.shopify.com/s/files/1/0556/5795/5430/articles/fortnite-chapter-3-season-2-overview-page-key-art-bg-1920x1080-080c6c393c60.jpg?v=1712937377",
    "21": "https://staticg.sportskeeda.com/editor/2022/06/010a7-16544364228602-1920.jpg",
    "22": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVYBl3trRJVmN2YxAFVMamB5c-MwXZQ82Rkg&s",
});

export const getBuildImage = (version: string, fallback?: string): string => {
    const imgs = getBuildImages();
    const key = version.split(".")[0];
    if (!fallback)
        fallback = `./seasons/season-${key}.jpg`;

    return imgs[key as keyof typeof imgs] || fallback || "";
};

export const getChapterAndSeason = (versionNumber: number) => {
    let chapter: number, season: number;

    if (versionNumber <= 10.4) {
        chapter = 1;
        season = Math.floor(versionNumber);
    } else if (versionNumber <= 18.4) {
        chapter = 2;
        season = Math.floor(versionNumber) - 10;
    } else if (versionNumber <= 22.4) {
        chapter = 3;
        season = Math.floor(versionNumber) - 18;
    } else if (versionNumber <= 27.11) {
        chapter = 4;
        season = Math.floor(versionNumber) - 22;
    } else {
        chapter = 5;
        season = Math.floor(versionNumber) - 27;
    }

    return { chapter, season };
};