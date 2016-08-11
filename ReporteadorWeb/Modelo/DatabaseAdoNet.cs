using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ReporteadorWeb.Modelo
{

    public class DatabaseAdoNet
    {
        static string ConexionSql = String.Empty;
        private const String Db = "DatabaseConnectionString";

        #region Conexion
        public DatabaseAdoNet()
        {
            ConexionSql = ConnectionString.GetConnectionString(Db);
        }

        private SqlConnection GetConnection() {
            SqlConnection cnn;
            cnn = new SqlConnection(ConexionSql);

            return cnn;
        }
        #endregion

        #region NoTransactional

        public DataTable ExecQuery(string query)
        {
            DataTable dt = new DataTable();
            SqlConnection cn = new SqlConnection();
            SqlCommand cmd = new SqlCommand();

            try
            {
                cn = GetConnection();                
                cmd.CommandText = query;
                cmd.CommandType = CommandType.Text;

                cmd.Connection = cn;

                cmd.CommandTimeout = 0;
                cn.Open();

                SqlDataAdapter da = new SqlDataAdapter(cmd);

                da.Fill(dt);

                cn.Close();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
            finally {
                if (cn != null)
                {
                    if (cn.State == ConnectionState.Open)
                    {
                        cn.Close();
                        cn.Dispose();
                    }
                }
                if (cmd != null) { 
                    cmd.Dispose();
                }

                cmd = null;
                cn = null;
            }

            return dt;
        }

        #endregion

        #region Utils
        public string ConvertDataTabletoString(DataTable dt)
        {
            System.Web.Script.Serialization.JavaScriptSerializer serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            Dictionary<string, object> row;
            foreach (DataRow dr in dt.Rows)
            {
                row = new Dictionary<string, object>();
                foreach (DataColumn col in dt.Columns)
                {
                    row.Add(col.ColumnName, dr[col]);
                }
                rows.Add(row);
            }

            serializer.MaxJsonLength = Convert.ToInt32(ConfigurationManager.AppSettings["maxJsonLength"]);

            return serializer.Serialize(rows);
        }
        #endregion
    }
}