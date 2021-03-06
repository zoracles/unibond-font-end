import { useEffect, useState }  from "react";
import { useWallet }            from "use-wallet";
import { useRouter }            from "next/router";
import { ethers }               from "ethers";
import axios                    from "axios";
import {
    Flex, 
    Box,
    Text,
    SimpleGrid,
    Spinner,
    Image,
    SkeletonText,
} from "@chakra-ui/core";
import {
    getTotalSupply
} from "../../contracts/univ3_positions_nft";
import {
    UNI_V3_NFT_POSITIONS_ADDRESS,
    EXPLORE_QUERY,
    UNISWAPV3IDS,
    JSON_PROVIDER,
} from "../../utils/const";
import {
    getTokenURI
} from "../../contracts/erc721";
const base64  = require("base-64");

const ExplorePage = () => {
    const router = useRouter();
    const [univ3Data, setUniv3Data] = useState([]);
    const [offset, setOffset] = useState(0);
    const [tSupply, setTSupply] = useState('');
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        initialize();
    }, []);

    const loadData = async (skip) => {
        try {
            let { data } = await axios.post(UNISWAPV3IDS, {
                query: EXPLORE_QUERY.replace("%1", skip),
            });
            if (data && data.data && data.data.tokenHolders) {
                const provider = new ethers.providers.JsonRpcProvider(JSON_PROVIDER);
                const _data = [];
                const _promises = [];
                const len = data.data.tokenHolders.length;
                for (let i = 0; i < len; i ++) {
                    const item = data.data.tokenHolders[i];
                    _promises.push(getTokenURI(UNI_V3_NFT_POSITIONS_ADDRESS, item.tokenId, provider));
                }
                const promiseResult = await Promise.all(_promises);
                for(let i = 0; i < promiseResult.length; i ++) {
                    try {
                        const item = data.data.tokenHolders[i];
                        const parts = promiseResult[i].split(",");
                        const bytes = base64.decode(parts[1]);
                        let jsonData = JSON.parse(bytes);
                        jsonData.tokenId = item.tokenId;
                        _data.push(jsonData);
                    } catch (e) {

                    }
                }
                console.log(_data);
                setUniv3Data(univ3Data.concat(_data));
                setOffset(offset + _data.length);
            }
        } catch (e) {
            console.log("error", e);
        }
    }

    const initialize = async () => {
        try {
            await loadData(0);
        } catch (e) {

        } finally {
            setLoading(false);
        }

        try {
            const provider = new ethers.providers.JsonRpcProvider(JSON_PROVIDER);
            const tSupply = await getTotalSupply(UNI_V3_NFT_POSITIONS_ADDRESS, provider);
            if (tSupply)
                setTSupply(tSupply);
        } catch (e) {

        }
    }

    const formattSupply = () => {
        if(!tSupply)
            return (
                <Flex>
                    <Spinner m="0.5rem auto"/>
                </Flex>
            );
        const tsupply = parseInt(tSupply) / 1000;
        return <Text fontWeight="bold" fontSize="30px" color="#ff0000">{tsupply.toString().match(/^-?\d+(?:\.\d{0,1})?/) + 'K'}</Text>
    }

    const onNFTSelect = (item) => {
        router.push("/pools/" + item.tokenId)
    }

    const loadMore = async () => {
        setLoading(true);
        try {
            await loadData(offset);
        } catch(e) {

        } finally {
            setLoading(false);
        }
    }

    return (
        <Box w="100%"  mt="6rem" minHeight="71vh" color="#0E0E0E">
            <Flex maxW="80rem" w="100%" m="3rem auto" p="0 1rem" flexDirection="column">
                <Box mb="2rem">
                    <Flex flexDirection="row" justifyContent="center">
                        <Image w="60px" src="/images/tokenpage/uni.png" borderRadius="100%"/>
                        <Text fontWeight="bold" fontSize="24px" m="auto 0 auto 1rem">Uniswap v3 NFTs</Text>
                    </Flex>
                    <Flex m="0 auto 1rem auto" flexDirection="row" justifyContent="center">
                        <Box bg="#FEF0F0" p="0.5rem 1rem" borderRadius="20px">
                            {formattSupply()}
                            <Text textAlign="center" color="#777">items</Text>
                        </Box>
                    </Flex>
                    <Text textAlign="center" color="#555" fontSize="14px">These represent all the NFTs created by Uniswap v3. Feel free to browse and uncover the power of concentrated liquidity.</Text>
                </Box>
                <SimpleGrid spacing="2rem" minChildWidth="15rem" w="100%">
                    {univ3Data.map((item, index) => {
                        return (
                            <Box key={index} p="2rem 0 0rem 0" borderRadius="10px" cursor="pointer" userSelect="none" bg="#EDF0F3" border="2px solid #EDF0F3"
                                _hover={{border: "2px solid #FB575F"}} transition="0.3s"
                                onClick={() => onNFTSelect(item)}
                            >
                                <Flex flexDirection="row" justifyContent="center">
                                    <Image src={item.image} maxW="150px"/>
                                </Flex>
                                <Text fontSize="12px" p="1rem 0.5rem" whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden">{item.name}</Text>
                            </Box>
                        )
                    })}
                </SimpleGrid>
                {loading?
                    <Box padding="6" boxShadow="lg">
                        <SkeletonText mt="4" noOfLines={4} spacing="4" />
                    </Box>:
                    <Flex
                        bg="#fff" border="1px solid #ff0000" color="#ff0000" p="0.5rem 2rem" borderRadius="30px" cursor="pointer" transition="0.2s" m="1rem auto" onClick={loadMore}
                        _hover={{bg: "#ff0000", color:"#fff"}}
                    >
                        <Text fontSize="14px" fontWeight="bold">Load more</Text>
                    </Flex>
                }
            </Flex>
        </Box>
    )
}

export default ExplorePage;
  