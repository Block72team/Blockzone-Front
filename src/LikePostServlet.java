import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

// Declaring a WebServlet called StarServlet, which maps to url "/api/star"
@WebServlet(name = "LikePostServlet", urlPatterns = "/api/like")
public class LikePostServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		response.setContentType("application/json"); // Response mime type
		response.setHeader("Access-Control-Allow-Origin", "*");

		// Retrieve parameter limit from url request.
		String id = request.getParameter("id");

		// Output stream to STDOUT
		PrintWriter out = response.getWriter();

		try {
			Context initCtx = new InitialContext();

            Context envCtx = (Context) initCtx.lookup("java:comp/env");
            if (envCtx == null)
                throw new Exception("context is null");

            // Look up our data source
			DataSource dataSource = (DataSource) envCtx.lookup("jdbc/masterdb");
			
			// Get a connection from dataSource
			Connection dbcon = dataSource.getConnection();

			// Construct a update with parameter represented by "?"
			String update = "update posts set likes = likes + 1 where id = ?";

			// Declare our statement
			PreparedStatement statement = dbcon.prepareStatement(update);

			// Set the parameter represented by "?" in the update to the id we get from url,
			// num 1 indicates the first "?" in the update
			statement.setInt(1, Integer.parseInt(id));

			// Perform the update
			if(statement.executeUpdate() > 0) {
				JsonObject jsonObject = new JsonObject();
				jsonObject.addProperty("status", true);

				// write JSON string to output
				out.write(jsonObject.toString());
				// set response status to 200 (OK)
				response.setStatus(200);
			} else {
				throw new Exception("Post Not found");
			}

			statement.close();
			dbcon.close();
		} catch (Exception e) {
			// write error message JSON object to output
			JsonObject jsonObject = new JsonObject();
			jsonObject.addProperty("errorMessage", e.getMessage());
			out.write(jsonObject.toString());

			// set reponse status to 500 (Internal Server Error)
			response.setStatus(500);
		}
		out.close();

	}

}
