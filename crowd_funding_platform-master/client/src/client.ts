// lib/client.ts
import { createThirdwebClient, defineChain, getContract } from "thirdweb";

const clientId = "7453d9a0b8701b92ae513d621d24794f"; 
const secretKey ="oOpH21nv7xk406f6O_vDcM8NtH1_czIrhJd_5B-IS3GCwSXu5D9uzS9NqFjxoi2sJnxq6a63Y_2F8C9XtU5_tg" // this will be used on the server-side

export const client = createThirdwebClient(
  secretKey ? { secretKey } : { clientId },
);

export const contract = getContract({
  client,
  chain: defineChain(11155111),
  address: "0x5DE9De05724b8860899ab0169E2d4FE17FaBAE68",
});

